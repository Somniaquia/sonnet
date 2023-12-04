from agent import ConversationSession, Agent
import json

import asyncio
import websockets

async def accept(websocket, path):
    while 1:
        data = await websocket.recv()
        data = json.loads(data)

        if data['type'] == 'userPrompt':
            print(data['content'], end='\r', flush=True)
            response = Agent.prompt(data['content'])
            await websocket.send(response)

        elif data['type'] == 'refuteInterrogation':
            print(data['content'], end='\r', flush=True)
            if data['content']['type'] == 'App':
                response = Agent.promptApp(data['content'])
            elif data['content']['type'] == 'Url':
                response = Agent.promptURL(data['content'])
            # TODO: Provide reason for either blocking or ignoring - and send the updated blocklist
            await websocket.send(response)
            
        elif data['type'] == 'fetchBlocklist':
            f = open("blocklist.json", 'r')
            print(f.read)
            await websocket.send(f.read())
            f.close()

start_server = websockets.serve(accept, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()