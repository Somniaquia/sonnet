from agent import ConversationSession, Agent
import json

import asyncio
import websockets
import blocker_module as blocker

async def accept(websocket, path):
    context = "studying mathematics"
    explanation = "I shouldn't be procrastinating by programming, drawing, composing, browsing trivial stuff on internet."
    blacklist_process_names, ignored_process_names = blocker.load_blocklist(context)

    current_processes = blocker.get_current_processes(ignored_process_names)
    while 1:
        data = await websocket.recv()
        data = json.loads(data)
        if data['type'] == 'msg':
            print(data['context'])
        
        previous_processes = current_processes
        current_processes = blocker.get_current_processes(ignored_process_names)

        new_processes = current_processes - previous_processes
        # print(new_processes)
        for process in new_processes:
            print(process.info)
            if process.info['name'] in blacklist_process_names:
                continue

            response = Agent.promptApp(process.info['name'], context, explanation).strip()
            
            if response == "yes":
                print(f"{process.info['name']} is considered a procrastination.")
                blacklist_process_names.add(process.info['name'])
                blocker.save_blocklist(context, blacklist_process_names, ignored_process_names)
            else:
                print("{process.info['name']} isn't considered a procrastination.")
                ignored_process_names.add(process.info['name'])
                blocker.save_blocklist(context, blacklist_process_names, ignored_process_names)

        for process in current_processes:
            if process.info['name'] in blacklist_process_names:
                blocker.kill_process_by_name(process.info['name'])
        print("test")

start_server = websockets.serve(accept, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()