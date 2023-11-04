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

def get_current_processes(ignored_process_names):
    return set([process for process in psutil.process_iter(['pid', 'name']) if process.info['name'] not in ignored_process_names])

def kill_process_by_name(process_name):
    for process in psutil.process_iter(['pid', 'name']):
        if process.info['name'] == process_name:
            process.terminate()
            print(f"Process {process_name} (PID: {process.info['pid']}) has been terminated.")
            return True
    return False