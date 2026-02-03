#!/bin/sh
set -e

# --- PRODUCTION SAFEGUARDS ---
DEFAULT_MODEL="cyankiwi/GLM-4.6V-AWQ-4bit"
MODEL_NAME="${MODEL_NAME:-$DEFAULT_MODEL}"
MODEL_NAME=$(echo "$MODEL_NAME" | xargs)

echo "Starting VLLM on NVIDIA DGX Spark (Grace Blackwell GB10)..."
echo "Target Model: '$MODEL_NAME'"
TOOL_PARSER="${TOOL_CALL_PARSER:-qwen3_coder}"

SERVE_PORT="${PORT:-8000}"
# 128GB Unified Memory: Reserve 92% to leave buffer for the runtime update below
MEMORY_UTILIZATION="${GPU_MEMORY_UTILIZATION:-0.92}"

# --- ENVIRONMENT OPTIMIZATION ---
# Forces Blackwell/GB10 FP4 kernels (Crucial for Spark performance)
export VLLM_USE_FLASHINFER_MOE_FP4=1
export VLLM_FLASHINFER_MOE_BACKEND=throughput 




# --- EXECUTION ---
exec python3 -m vllm.entrypoints.openai.api_server \
    --model "$MODEL_NAME" \
    --trust-remote-code \
    --kv-cache-dtype fp8 \
    --max-model-len 131072 \
    --max-num-seqs 128 \
    --gpu-memory-utilization "$MEMORY_UTILIZATION" \
    --enable-chunked-prefill \
    --max-num-batched-tokens 8192 \
    --enable-prefix-caching \
    --tool-call-parser "$TOOL_PARSER" \
    --enable-auto-tool-choice \
    --reasoning-parser "$REASONING_PARSER" \
    --host 0.0.0.0 \
    --port "$SERVE_PORT" \
    --tensor-parallel-size 1 \
    --served-model-name "model"