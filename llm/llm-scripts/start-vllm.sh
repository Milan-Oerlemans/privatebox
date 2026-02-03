#!/bin/bash
set -e

# --- 1. CUSTOM SCRIPT OVERRIDE (The "Bypass") ---
# If CUSTOM_SCRIPT is set and exists, run it and ignore the rest of this file.
if [[ -n "$CUSTOM_SCRIPT" ]]; then
    if [[ -f "$CUSTOM_SCRIPT" ]]; then
        echo "⚡ Custom script detected at: $CUSTOM_SCRIPT"
        echo "⚡ Transferring control to custom script..."
        chmod +x "$CUSTOM_SCRIPT"
        exec "$CUSTOM_SCRIPT"
    else
        echo "⚠️  WARNING: CUSTOM_SCRIPT defined ('$CUSTOM_SCRIPT') but file not found."
        echo "   Falling back to standard startup logic..."
    fi
fi

# --- 2. PRE-FLIGHT CHECKS & DEFAULTS ---

# Model Name (Required)
if [[ -z "$MODEL_NAME" ]]; then
    echo "❌ ERROR: MODEL_NAME environment variable is not set."
    exit 1
fi

# Port
PORT="${PORT:-12001}"

# Performance & Hardware Defaults (Optimized for Blackwell/GB200)
# We use defaults, but allow ENV vars to override them for other models/GPUs.
KV_CACHE_DTYPE="${KV_CACHE_DTYPE:-fp8}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-131072}"
TP_SIZE="${TENSOR_PARALLEL_SIZE:-1}"
gpu_mem_util="${GPU_MEMORY_UTILIZATION:-0.9}"
MAX_NUM_SEQS="${MAX_NUM_SEQS:-128}"

# Tool & Reasoning Defaults
# If not set, we don't pass the flag (letting vLLM choose its internal default) 
# OR we pass a safe default if the flag is required.
TOOL_PARSER_FLAG=""
if [[ -n "$TOOL_CALL_PARSER" ]]; then
    TOOL_PARSER_FLAG="--tool-call-parser $TOOL_CALL_PARSER"
fi

REASONING_FLAG=""
if [[ -n "$REASONING_PARSER" ]]; then
    REASONING_FLAG="--reasoning-parser $REASONING_PARSER"
fi

echo "🚀 Starting vLLM..."
echo "--------------------------------"
echo "Target Model:   $MODEL_NAME"
echo "System Spec:    TP=$TP_SIZE | Mem=$gpu_mem_util | Dtype=$KV_CACHE_DTYPE | max-num-seqs=$MAX_NUM_SEQS"
echo "Extra Args:     ${VLLM_EXTRA_ARGS:-None}"
echo "--------------------------------"

#TODO: Temp Add to env variables

# 1. CRITICAL: Enables the specific FP4 MoE kernels for Blackwell
export VLLM_USE_FLASHINFER_MOE_FP4=1
# 2. CRITICAL: Sets the backend mode (throughput often more stable for these huge models)
export VLLM_FLASHINFER_MOE_BACKEND=throughput
# export VLLM_TORCH_COMPILE_LEVEL=0

# --- 3. EXECUTION ---

# We build the command as an array to safely handle optional flags and spaces
CMD=(
    python3 -m vllm.entrypoints.openai.api_server
    --model "$MODEL_NAME"
    --served-model-name "model"
    --trust-remote-code
    --host 0.0.0.0
    --port "$PORT"
    # --enforce-eager

    
    # Dynamic Hardware Specs
    --kv-cache-dtype "$KV_CACHE_DTYPE"
    --max-model-len "$MAX_MODEL_LEN"
    --tensor-parallel-size "$TP_SIZE"
    --gpu-memory-utilization "$gpu_mem_util"
    --max-num-seqs "$MAX_NUM_SEQS"
    
    # Optimization Flags (Standard for your setup)
    --enable-chunked-prefill
    --max-num-batched-tokens 8192
    --enable-prefix-caching
    
    # Dynamic Functionality
    --chat-template-content-format auto
    --enable-auto-tool-choice
)

# Add conditional flags
if [[ -n "$TOOL_PARSER_FLAG" ]]; then CMD+=($TOOL_PARSER_FLAG); fi
if [[ -n "$REASONING_FLAG" ]]; then CMD+=($REASONING_FLAG); fi

# Add the "Escape Hatch" (Any extra arguments passed via ENV)
# We use eval/expansion here carefully to allow multiple flags in one string
if [[ -n "$VLLM_EXTRA_ARGS" ]]; then 
    CMD+=($VLLM_EXTRA_ARGS)
fi

# Execute preserving PID 1
exec "${CMD[@]}"