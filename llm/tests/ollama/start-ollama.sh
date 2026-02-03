#!/bin/sh
set -e

# ==========================================================
# CONFIG
# ==========================================================
BASE_MODEL="hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:IQ4_NL"
CUSTOM_MODEL="qwen3-4b-ctx16k"
CTX=16384
MODEL_DIR="/models/qwen3-16k"

# ==========================================================
# WAIT FOR OLLAMA ENGINE
# ==========================================================
wait_for_ollama() {
  echo "⏳ Waiting for Ollama to be ready..."
  until ollama list >/dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Ollama is ready!"
}

# ==========================================================
# START SERVER
# ==========================================================
echo "🧠 Starting Ollama server..."
ollama serve &
SERVER_PID=$!

wait_for_ollama

# ==========================================================
# CREATE MODEL DIRECTORY
# ==========================================================
mkdir -p "$MODEL_DIR"

# ==========================================================
# GENERATE MODEFILE
# ==========================================================
echo "📄 Writing Modelfile for $CUSTOM_MODEL"

cat > "$MODEL_DIR/Modelfile" <<EOF
FROM $BASE_MODEL

# Enable long context window
PARAMETER num_ctx $CTX

# Optional: Keep in memory
# PARAMETER num_keep 256

EOF

# ==========================================================
# CREATE CUSTOM MODEL
# ==========================================================
echo "📦 Building model: $CUSTOM_MODEL"
ollama create "$CUSTOM_MODEL" -f "$MODEL_DIR/Modelfile"

echo "🎉 Model created: $CUSTOM_MODEL (ctx=$CTX)"
echo "➡️ Run it with: ollama run $CUSTOM_MODEL"

# ==========================================================
# KEEP SERVER RUNNING
# ==========================================================
wait $SERVER_PID
