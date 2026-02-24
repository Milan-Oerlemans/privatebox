import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

# Initialize FastAPI
app = FastAPI(title="Jailbreak Sentinel V2 Service")

# DGX Optimization: Grace Blackwell (DGX Spark) handles fp16/bf16 very efficiently
MODEL_ID = "qualifire/prompt-injection-jailbreak-sentinel-v2"

print(f"Loading {MODEL_ID} into GPU memory...")

# Setup Model and Tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_ID, 
    torch_dtype=torch.float16, 
    device_map="cuda" # Automatically maps to available GPU on DGX
)

# Initialize Pipeline
# device=0 ensures it uses the first available GPU
pipe = pipeline("text-classification", model=model, tokenizer=tokenizer, device=0)

class ClassificationRequest(BaseModel):
    text: str

@app.post("/classify")
async def classify(request: ClassificationRequest):
    try:
        # Perform classification
        results = pipe(request.text)
        # Typically returns: [{'label': 'LABEL_X', 'score': 0.99}]
        return {"status": "success", "data": results[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Error: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None"
    }