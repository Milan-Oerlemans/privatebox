# vLLM Setup Guide

This directory contains configuration for running vLLM with dynamic model selection via environment variables.

## Quick Start

```bash
# 1. Copy environment template
cp .env.template .env

# 2. Edit .env with your configuration
#    - Set HF_TOKEN (required for gated models)
#    - Set MODEL_NAME (e.g., nvidia/Qwen3-Next-80B-A3B-Thinking-NVFP4)
#    - Adjust PORT if needed (default: 12001)

# 3. Start the container
docker compose up -d

# 4. Check health
curl http://localhost:12001/health
```

## Docker Compose Commands

```bash
# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop container
docker compose down

# Restart container
docker compose restart

# Rebuild and start
docker compose up -d --build
```

## Environment Variables Reference

### Essential (Required)
- `HF_TOKEN` - Hugging Face token for gated models
- `MODEL_NAME` - Hugging Face repo ID (e.g., `nvidia/Qwen3-Next-80B-A3B-Thinking-NVFP4`)
- `PORT` - API server port (default: `12001`)

### Hardware & Memory
- `GPU_MEMORY_UTILIZATION` - GPU RAM allocation (0.0-1.0, default: `0.80`)
- `KV_CACHE_DTYPE` - KV cache data type (`auto`/`fp8`, default: `fp8`)
- `MAX_MODEL_LEN` - Maximum context length (default: `131072`)
- `TENSOR_PARALLEL_SIZE` - GPU count for model splitting (default: `1`)

### Performance Optimization
- `MAX_NUM_SEQS` - Max concurrent requests (default: `128`)
- `ENABLE_CHUNKED_PREFILL` - Chunk prompt processing (enabled by default)
- `MAX_NUM_BATCHED_TOKENS` - Tokens per iteration (default: `8192`)
- `ENABLE_PREFIX_CACHING` - Cache shared system prompts (enabled by default)

### Tool & Reasoning
- `TOOL_CALL_PARSER` - Tool calling parser (`hermes`/`mistral`/`qwen3_coder`)
- `REASONING_PARSER` - Reasoning parser (`qwen3_coder`/`deepseek_r1`)

### Escape Hatch
- `VLLM_EXTRA_ARGS` - Additional vLLM arguments (e.g., `"--seed 42 --enforce-eager"`)

## Custom Scripts

Set `CUSTOM_SCRIPT=/scripts/my_script.sh` in `.env` to bypass default startup and run a custom script.

## Available Model Scripts

Pre-configured scripts in `llm-scripts/`:

| Script | Model | Port | Notes |
|--------|-------|------|-------|
| `start-vllm.sh` | Dynamic (via MODEL_NAME) | 12001 | Main entry point |
| `qwen/start-Qwen3-Next-80B-A3B-Instruct-AWQ-4bit.sh` | Qwen3-Next-80B | 12001 | Qwen-specific |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4.sh` | Nemotron-3-Nano | 8000 | GPU-optimized |
| `zai/GLM-4.7-Flash-AWQ-4bit.sh` | GLM-4.7V | 8000 | ZAI model |

## API Endpoint

The OpenAI-compatible API is exposed on the local network at:

- **Address**: `http://privatebox.local:12001` (or `http://localhost:12001`)
- **Default Port**: 12001 (configure via `PORT` in `.env`)

### Production Security Notice

⚠️ **DO NOT expose this endpoint directly in production**. This vLLM instance should only be accessible behind the Onyx API layer, which provides:

- Authentication & authorization
- Rate limiting
- Usage tracking
- audit logging

Direct API calls bypass Onyx's security controls. In production, route all model requests through `https://your-onyx-domain.com/api/...` with proper JWT/Bearer token authentication.

## Key Configuration Notes

1. **GPU Memory**: For 24GB VRAM, set `GPU_MEMORY_UTILIZATION=0.80` and `MAX_MODEL_LEN=8192`
2. **FP8 Quantization**: Recommended for H100/Blackwell GPUs (reduces RAM by ~50%)
3. **FlashInfer**: Enabled via `VLLM_USE_FLASHINFER_MOE_FP4=1` for Blackwell FP4 kernels
4. **Prefix Caching**: Dramatically improves performance for agents/chatbots with long system prompts
