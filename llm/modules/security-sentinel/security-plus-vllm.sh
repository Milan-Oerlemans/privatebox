#!/bin/bash
set -e

# ==============================================================================
#  vLLM STARTUP SCRIPT (Merged Configuration)
# ==============================================================================

# --- 1. CUSTOM SCRIPT OVERRIDE (The "Bypass") ---
# If CUSTOM_SCRIPT is set and exists, run it and ignore the rest of this file.
# if [[ -n "$CUSTOM_SCRIPT" ]]; then
#     if [[ -f "$CUSTOM_SCRIPT" ]]; then
#         echo "⚡ Custom script detected at: $CUSTOM_SCRIPT"
#         echo "⚡ Transferring control to custom script..."
#         chmod +x "$CUSTOM_SCRIPT"
#         exec "$CUSTOM_SCRIPT"
#     else
#         echo "⚠️  WARNING: CUSTOM_SCRIPT defined ('$CUSTOM_SCRIPT') but file not found."
#         echo "   Falling back to standard startup logic..."
#     fi
# fi

# --- 2. CONFIGURATION & DEFAULTS ---
# Values here act as defaults. You can override them by setting the ENV var 
# before running the script (e.g., PORT=8000 ./start.sh).

# Model Configuration
# Default: qualifire/prompt-injection-jailbreak-sentinel-v2-GGUF:Q4_0
MODEL_NAME="qualifire/prompt-injection-jailbreak-sentinel-v2"

# Start a local OpenAI-compatible server with a web UI:

# Server Configuration
PORT="12002"

# Hardware Optimization (Blackwell/Grace Defaults)
# Use 'fp8' for H100/Blackwell, 'auto' or 'float16' for older cards
KV_CACHE_DTYPE="fp8"

# Context Window: Reduced to 32768 to prevent RAM exhaustion
MAX_MODEL_LEN="32768"

# Lower this if you get OOM (Out of Memory) errors (Default: 0.1)
GPU_MEMORY_UTILIZATION="0.1"

# Parallelism & Sequence Settings
TP_SIZE="1"
MAX_NUM_SEQS="${MAX_NUM_SEQS:-8}"

# Escape Hatch (Extra flags like "--enable-lora --seed 42")
VLLM_EXTRA_ARGS="${VLLM_EXTRA_ARGS:-}"

# --- 3. ADVANCED ENVIRONMENT EXPORTS ---

# # CRITICAL: Enables the specific FP4 MoE kernels for Blackwell
# export VLLM_USE_FLASHINFER_MOE_FP4=1

# # CRITICAL: Sets the backend mode (throughput often more stable for these huge models)
# export VLLM_FLASHINFER_MOE_BACKEND=throughput

# Optional: Torch compile level (commented out by default)
# export VLLM_TORCH_COMPILE_LEVEL=0

# --- 4. PREPARATION ---

# # Tool & Reasoning Handling
# TOOL_PARSER_FLAG=""
# if [[ -n "$TOOL_CALL_PARSER" ]]; then
#     TOOL_PARSER_FLAG="--tool-call-parser $TOOL_CALL_PARSER"
# fi

# REASONING_FLAG=""
# if [[ -n "$REASONING_PARSER" ]]; then
#     REASONING_FLAG="--reasoning-parser $REASONING_PARSER"
# fi

echo "Starting vLLM..."
echo "--------------------------------"
echo "Target Model:   $MODEL_NAME"
echo "Port:           $PORT"
echo "System Spec:    TP=$TP_SIZE | Mem=$GPU_MEMORY_UTILIZATION | Dtype=$KV_CACHE_DTYPE | MaxLen=$MAX_MODEL_LEN"
echo "Extra Args:     ${VLLM_EXTRA_ARGS:-None}"
echo "--------------------------------"

# --- 5. EXECUTION ---

# We build the command as an array to safely handle optional flags and spaces
CMD=(
    python3 -m vllm.entrypoints.openai.api_server
    --model "$MODEL_NAME"
    --served-model-name "Sentinel-Plus"
    --task classify
    --trust-remote-code
    --host 0.0.0.0
    --port "$PORT"
    # --enforce-eager

    # Dynamic Hardware Specs
    --kv-cache-dtype "$KV_CACHE_DTYPE"
    --max-model-len "$MAX_MODEL_LEN"
    --tensor-parallel-size "$TP_SIZE"
    --gpu-memory-utilization "$GPU_MEMORY_UTILIZATION"
    --max-num-seqs "$MAX_NUM_SEQS"
    
    # Optimization Flags
    --enable-chunked-prefill
    --max-num-batched-tokens 8192
    --enable-prefix-caching
    
    # Dynamic Functionality
    --chat-template-content-format auto

)

# # Add conditional flags
# if [[ -n "$TOOL_PARSER_FLAG" ]]; then CMD+=($TOOL_PARSER_FLAG); fi
# if [[ -n "$REASONING_FLAG" ]]; then CMD+=($REASONING_FLAG); fi

# # Add the "Escape Hatch" (Any extra arguments passed via ENV)
# if [[ -n "$VLLM_EXTRA_ARGS" ]]; then 
#     CMD+=($VLLM_EXTRA_ARGS)
# fi

# Execute preserving PID 1
exec "${CMD[@]}"