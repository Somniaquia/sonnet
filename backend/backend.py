from agent import ConversationSession, Agent
import json

import asyncio
import websockets

async def echo(websocket, path):
    async for message in websocket:
        print(f"Backend received a message: {message}")
        response = "fallback"
        try:
            response = Agent.prompt(json.loads(message)['message'])
        except json.JSONDecodeError as e:
            print(e)

        await websocket.send(json.dumps({"response": response}))

start_server = websockets.serve(echo, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()