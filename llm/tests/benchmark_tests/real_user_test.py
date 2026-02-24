import asyncio
import aiohttp
import time
import numpy as np
import random

# =================CONFIGURATION=================
BASE_URL = "http://localhost:12001/v1/chat/completions"
MODEL_NAME = "model" # As seen in your curl output
NUM_USERS = 35       # Total seats sold
TEST_DURATION = 60   # How long to run the test (seconds)

# User Behavior Profile
MIN_THINK_TIME = 5   # Seconds (Fastest user)
MAX_THINK_TIME = 30  # Seconds (Slowest user)
# ===============================================

# Metrics Store
latencies = []
ttfts = []     # Time to First Token
speeds = []    # Tokens per Second

async def simulated_user(user_id, session):
    """Simulates one user who types, sends a prompt, and waits."""
    print(f"User {user_id} logged in.")
    
    end_time = time.time() + TEST_DURATION
    
    while time.time() < end_time:
        # 1. THINKING (Simulate typing/reading)
        think_time = random.uniform(MIN_THINK_TIME, MAX_THINK_TIME)
        await asyncio.sleep(think_time)
        
        # 2. PROMPTING
        start_req = time.time()
        try:
            # We use a stream to measure TTFT accurately
            async with session.post(
                BASE_URL,
                json={
                    "model": MODEL_NAME,
                    "messages": [{"role": "user", "content": "Write a short poem about coding."}],
                    "stream": True, 
                    "max_tokens": 150
                }
            ) as response:
                
                if response.status != 200:
                    print(f"User {user_id}: Error {response.status}")
                    continue

                # 3. RECEIVING STREAM
                first_token_received = False
                token_count = 0
                
                async for line in response.content:
                    if not line: continue
                    
                    # Measure TTFT on first valid chunk
                    if not first_token_received:
                        ttft = (time.time() - start_req) * 1000 # ms
                        ttfts.append(ttft)
                        first_token_received = True
                    
                    token_count += 1

                # Measure Total Speed
                total_time = time.time() - start_req
                if total_time > 0:
                    tps = token_count / total_time
                    speeds.append(tps)
                    latencies.append(total_time)
                    
                print(f"User {user_id}: Got {token_count} tokens in {total_time:.1f}s (Speed: {tps:.1f} t/s)")

        except Exception as e:
            print(f"User {user_id} crashed: {e}")

async def main():
    print(f"--- STARTING REAL-WORLD SIMULATION: {NUM_USERS} USERS ---")
    async with aiohttp.ClientSession() as session:
        tasks = [simulated_user(i, session) for i in range(NUM_USERS)]
        await asyncio.gather(*tasks)

    # =================REPORT=================
    print("\n" + "="*40)
    print("       REAL USER EXPERIENCE REPORT       ")
    print("="*40)
    if not ttfts:
        print("No successful requests.")
        return

    avg_ttft = np.mean(ttfts)
    p95_ttft = np.percentile(ttfts, 95)
    avg_speed = np.mean(speeds)
    min_speed = np.min(speeds)

    print(f"Total Requests Processed: {len(ttfts)}")
    print("-" * 30)
    print(f"Wait Time (TTFT):")
    print(f"  Average:   {avg_ttft:.0f} ms")
    print(f"  Worst 5%:  {p95_ttft:.0f} ms  <-- CRITICAL METRIC")
    print("-" * 30)
    print(f"Generation Speed:")
    print(f"  Average:   {avg_speed:.1f} t/s")
    print(f"  Slowest:   {min_speed:.1f} t/s")
    print("-" * 30)

    if p95_ttft > 2000:
        print("❌ FAILED: Users are waiting > 2 seconds.")
    elif avg_speed < 15:
        print("⚠️ WARNING: Generation is sluggish (< 15 t/s).")
    else:
        print("✅ PASSED: 35 Users is a smooth experience.")

if __name__ == "__main__":
    asyncio.run(main())