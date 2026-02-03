#!/bin/sh

# Fail on any error
set -e

# --- PRODUCTION SAFEGUARDS ---

# 1. Sanitize the MODEL_NAME variable.
DEFAULT_MODEL="cyankiwi/Qwen3-Next-80B-A3B-Instruct-AWQ-4bit"
MODEL_NAME="${MODEL_NAME:-$DEFAULT_MODEL}"
MODEL_NAME=$(echo "$MODEL_NAME" | xargs)

# 2. Validate inputs
if [ -z "$MODEL_NAME" ]; then
    echo "ERROR: MODEL_NAME environment variable is not set."
    echo "Please set MODEL_NAME in your docker-compose.yml"
    exit 1
fi

echo "Starting VLLM on NVIDIA DGX Spark (Grace Blackwell GB10)..."
echo "Target Model: '$MODEL_NAME'"

# 3. Port Handling
SERVE_PORT="${PORT:-12001}"

# 4. Memory Management
# Default to 0.9 (90%) if not set. 
# On a 128GB system, 0.9 = ~115GB reserved. 
MEMORY_UTILIZATION="${GPU_MEMORY_UTILIZATION:-0.9}"
echo "Memory Utilization Limit: $MEMORY_UTILIZATION"

# 5. Tool Calling Configuration
# 'hermes' is widely recommended for Qwen3/Qwen2.5 tool usage. 
TOOL_PARSER="${TOOL_CALL_PARSER:-hermes}"
echo "Tool Call Parser: $TOOL_PARSER"

# 6. Reasoning Configuration (FIX FOR <THINK> TAGS)
# Qwen3/DeepSeek models output <think> tags. 
# We must use a parser to separate this from the final answer so the UI can render it properly.
# 'deepseek_r1' is the standard parser for <think> tags.
REASONING_PARSER="${REASONING_PARSER:-qwen3_coder}"
echo "Reasoning Parser: $REASONING_PARSER"

# --- EXECUTION ---

exec python3 -m vllm.entrypoints.openai.api_server \
    --model "$MODEL_NAME" \
    --served-model-name model \
    --trust-remote-code \
    --kv-cache-dtype fp8 \
    --max-model-len 131072 \
    --max-num-seqs 128 \
    --tensor-parallel-size 1 \
    --gpu-memory-utilization "$MEMORY_UTILIZATION" \
    --enable-chunked-prefill \
    --max-num-batched-tokens 8192 \
    --enable-prefix-caching \
    --enable-auto-tool-choice \
    --tool-call-parser hermes \
    --reasoning-parser qwen3 \
    --chat-template-content-format auto \
    --host 0.0.0.0 \
    --port "$SERVE_PORT"