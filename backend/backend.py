from agent import ConversationSession, Agent
import json

import asyncio
import websockets

async def echo(websocket, path):
    async for message in websocket:
        print(f"Received message: {message}")

        Agent.prompt(json.message)

        await websocket.send(f"Echo: {message}")

start_server = websockets.serve(echo, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()