from agent import ConversationSession, Agent
import json

import asyncio
import websockets

async def accept(websocket, path):
    while 1:
        data = await websocket.recv()
        data = json.loads(data)
        if data['type'] == 'msg':
            print(data['context'])
        elif data['type'] == 'fileAccess':
            f = open("blocklist.json", 'r')
            print(f.read)
            await websocket.send(f.read())
            f.close()

start_server = websockets.serve(accept, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()