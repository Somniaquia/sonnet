import psutil
from agent import Agent
import json

def save_blocklist(task, blocked, ignored):
    try:
        with open('blocklist.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    
    data[task] = {
        "blocked": list(blocked),
        "ignored": list(ignored)
    }

    with open('blocklist.json', 'w') as f:
        json.dump(data, f, indent=4)

def load_blocklist(task):
    try:
        with open('blocklist.json', 'r') as f:
            data = json.load(f)
        if task in data:
            print(data[task])
            return set(data[task]["blocked"]), set(data[task]["ignored"])
        else:
            return set(), set()
    except FileNotFoundError:
        return set(), set()
    
context = "studying mathematics"
explanation = "I shouldn't be procrastinating by programming, drawing, composing, browsing trivial stuff on internet."
blacklist_process_names, ignored_process_names = load_blocklist(context)

def get_current_processes():
    return set([process for process in psutil.process_iter(['pid', 'name']) if process.info['name'] not in ignored_process_names])

def kill_process_by_name(process_name):
    for process in psutil.process_iter(['pid', 'name']):
        if process.info['name'] == process_name:
            process.terminate()
            print(f"Process {process_name} (PID: {process.info['pid']}) has been terminated.")
            return True
    return False

current_processes = get_current_processes()

while True:
    previous_processes = current_processes
    current_processes = get_current_processes()

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
            save_blocklist(context, blacklist_process_names, ignored_process_names)
        else:
            print("{process.info['name']} isn't considered a procrastination.")
            ignored_process_names.add(process.info['name'])
            save_blocklist(context, blacklist_process_names, ignored_process_names)

    for process in current_processes:
        if process.info['name'] in blacklist_process_names:
            kill_process_by_name(process.info['name'])