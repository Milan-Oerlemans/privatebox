import asyncio
import httpx

async def body_gen():
    yield b"hello "
    yield b"world"

async def main():
    async with httpx.AsyncClient() as client:
        req = client.build_request("POST", "https://httpbin.org/post", content=body_gen())
        res = await client.send(req)
        print(res.json()["data"])

asyncio.run(main())
