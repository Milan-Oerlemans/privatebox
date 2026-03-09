#!/bin/bash

# Ensure we have a valid API Key
# Note: You should replace "YOUR_ONYX_API_KEY" with an actual API key generated in the Onyx admin UI
API_KEY="on_XhSpuK4TRz7jqX7ouBqlFNYovaUkNxCotuBvjHjWw-1P0zUY1G4EBTguRQkDwyZvPtbhBwphCgMBDZ2yNe1aFBcjXIM6Ex3aXEr-7D5KvkcARvDHEANjp4rE4iFy1Yb8bQ7jX__B8hSWTZ61hVaYbF2qNBttuy_M3acxVeacGwg3P8EURT-BXdNp4dwhcNhKk2rQGvSOw4xTMqYCClziz5wh8dPe-eNxth2N5ajTUnH3tMewV4KVHliU9458ZI6V"

# echo "Testing Chat Completions API..."
# curl -X POST "http://localhost/api/ai/v1/chat/completions" \
#   -H "Authorization: Bearer $API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "model": "gpt-4",
#     "messages": [
#       {
#         "role": "system",
#         "content": "You are a helpful assistant."
#       },
#       {
#         "role": "user",
#         "content": "Hello! Can you hear me?"
#       }
#     ],
#     "stream": true
#   }'

echo -e "\n\nTesting Models API..."
curl -X GET "http://localhost/api/ai/v1/models" \
  -H "Authorization: Bearer $API_KEY"
