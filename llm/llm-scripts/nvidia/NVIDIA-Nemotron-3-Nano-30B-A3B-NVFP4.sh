#!/bin/sh

# Fail on any error
set -e

# --- PRODUCTION SAFEGUARDS ---

# 1. Sanitize the MODEL_NAME variable.

MODEL_NAME="nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4"
echo "Starting VLLM on NVIDIA DGX Spark (Grace Blackwell GB10)..."
echo "Target Model: '$MODEL_NAME'"

# 2. Port Handling
SERVE_PORT="${PORT:-8000}"

# 3. Memory Management
# 128GB Unified Memory is massive. 
# We reserve 95% for vLLM to maximize the KV cache size for high concurrency.
MEMORY_UTILIZATION="0.4"
echo "Memory Utilization Limit: $MEMORY_UTILIZATION"

# 4. Tool & Reasoning Config
TOOL_PARSER="${TOOL_CALL_PARSER:-qwen3_coder}"
REASONING_PARSER_NAME="${REASONING_PARSER:-nano_v3}"
REASONING_PLUGIN_FILE="nano_v3_reasoning_parser.py"

# --- DEPENDENCY CHECK ---

if [ ! -f "$REASONING_PLUGIN_FILE" ]; then
    echo "Reasoning plugin not found. Downloading $REASONING_PLUGIN_FILE..."
    wget -q "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4/resolve/main/$REASONING_PLUGIN_FILE"
    echo "Download complete."
fi

# --- ENVIRONMENT OPTIMIZATION ---

# Enable FlashInfer for Blackwell (FP4/FP8 Ops)
export VLLM_USE_FLASHINFER_MOE_FP4=1
# 'throughput' favors batching over latency. 
# Use 'latency' if Time-To-First-Token (TTFT) is critical, but for bulk throughput, use 'throughput'.
export VLLM_FLASHINFER_MOE_BACKEND=throughput 

# --- EXECUTION ---

# CHANGES EXPLAINED:
# --max-num-seqs 64: Increased from 8. Allows 64 concurrent requests. 
#                    Crucial for high throughput on 128GB VRAM.
# --enable-chunked-prefill: Prevents long prompts from stalling the queue.
# --enable-prefix-caching: Reuses KV cache for shared system prompts.
# --max-model-len 131072: Reduced from 262k to 131k. 
#                         Trade-off: 262k requires massive blocks. 131k is still huge 
#                         but allows for higher concurrency in the remaining memory.
#                         (Revert to 262144 if your specific use case requires >131k context)

exec python3 -m vllm.entrypoints.openai.api_server \
    --model "$MODEL_NAME" \
    --served-model-name model \
    --trust-remote-code \
    --kv-cache-dtype fp8 \
    --max-model-len 32000 \
    --max-num-seqs 128 \
    --tensor-parallel-size 1 \
    --gpu-memory-utilization "$MEMORY_UTILIZATION" \
    --enable-chunked-prefill \
    --max-num-batched-tokens 8192 \
    --enable-prefix-caching \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder \
    --reasoning-parser-plugin nano_v3_reasoning_parser.py \
    --reasoning-parser nano_v3 \
    --host 0.0.0.0 \
    --port "$SERVE_PORT"