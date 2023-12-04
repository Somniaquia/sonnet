import json
import re
from langchain.chat_models import ChatOpenAI

from dotenv import load_dotenv
import os
from datetime import date, datetime

from transpeaker import Transpeaker

load_dotenv()
api_key = os.getenv('OPENAI_KEY')
gpt3_5 = ChatOpenAI(openai_api_key=api_key, model_name='gpt-4')
gpt4 = ChatOpenAI(openai_api_key=api_key, model_name='gpt-3.5-turbo')

def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def extract_numbers(string):
    return [int(item) for item in re.split(r'''[ ,:\n;()."']+''', string) if is_int(item.strip())]

class PromptResponsePair:
    def __init__(self, humanMessage, AIMessage):
        self.time = datetime.now().strftime("%H:%M:%S")
        self.humanMessage = humanMessage
        self.AIMessage = AIMessage
        self.summarization = f"User: {self.humanMessage}\nYou: {self.AIMessage}\n"

    def disentangle(self):
        return f"At {self.time} - User: {self.humanMessage}\nYou: {self.AIMessage}\n"
    
    def summarize(self):
        self.summarization = gpt4.predict(f"Summarize in a single short sentence what this 'user message - your message pair' talks about, distinguishing between user's message and your message: \n{self.disentangle()}") + "\n"
        return self.summarization
    
    def to_dict(self):
        return {
            'time': self.time,
            'humanMessage': self.humanMessage,
            'AIMessage': self.AIMessage,
            'summarization': self.summarization
        }

    @staticmethod
    def from_dict(data):
        pair = PromptResponsePair(data['humanMessage'], data['AIMessage'])
        pair.summarization = data['summarization']
        return pair

def get_non_conflicting_filename(base_dir, base_name, extension):
    n = 0
    while True:
        filename = f"{base_name}_{n}.{extension}"
        file_path = os.path.join(base_dir, filename)
        if not os.path.exists(file_path):
            return file_path
        n += 1

class ConversationSession:
    def __init__(self, load_path = None):
        if load_path == None:
            self.promptResponsePairs = []
            self.date = date.today()
            self.summarization = None
            self.load_path = get_non_conflicting_filename("conversationSessions", "session", "json")
        else:
            with open(load_path, 'r') as f:
                data = json.load(f)
                self.date = date.fromisoformat(data['date'])
                self.promptResponsePairs = [PromptResponsePair.from_dict(pair) for pair in data['promptResponsePairs']]
                self.summarization = data['summarization']
                self.load_path = load_path

                # print(self.disentangle(False))

    def save(self):
        with open(self.load_path, 'w') as f:
            json.dump({
                'date': self.date.isoformat(),
                'summarization': self.summarization,
                'promptResponsePairs': [pair.to_dict() for pair in self.promptResponsePairs],
            }, f, indent=4)

    def reminisce(self, prompt):
        if self.promptResponsePairs == []:
            return ""

        while True:
            summarized = self.disentangle(True)

            options = summarized
            options += f'''\nPrior paragraphs were detailed summarizations of a conversation session from {self.date}, {(date.today() - self.date).days} days ago, in format of 'Session n from (date)'. Decide what pairs to view underlying conversations of the summarization above in order to grasp best of the context by typing only their associated number n seperated with commas (ex: '0,1,2,3,13,14' without quote marks). Do not type anything except numbers and commas and only choose directly involved in the context. \n\nThis is the message sent by the user: "{prompt}".'''
            # print(options)
            choices = gpt4.predict(options)
            # print(f"\nAGENT CHOICE OF VIEWING CONVERSATION PAIRS: {choices}")
            
            if choices == "":
                pair_numbers = []
                break

            try:
                pair_numbers = extract_numbers(choices)
                print(f"VIEWING MEMORY PAIRS {pair_numbers} OF SESSION FROM {self.date}")
            except Exception as e:
                print(e)
                continue
            
            break

        reminiscence = ""
        for i, pair in enumerate(self.promptResponsePairs):
            if i in pair_numbers:
                # reminiscence += f'Pair {i} (viewing details): '
                reminiscence += pair.disentangle() + "\n\n"
            else:
                # reminiscence += f'Pair {i}: '
                reminiscence += pair.summarization

        return reminiscence

    def disentangle(self, summarized=True):
        disentangled = ""

        if summarized:
            for i, pair in enumerate(self.promptResponsePairs):
                disentangled += f'Pair {i}: '
                disentangled += pair.summarization
        else:
            for i, pair in enumerate(self.promptResponsePairs):
                disentangled += pair.disentangle()

        return disentangled + "\n\n"

    def prompt(self, prompt):
        reminiscence = self.reminisce(prompt)
        # print('\n' + reminiscence + prompt + '\n')
        response = gpt4.predict(reminiscence + prompt)
        print(response)
        Transpeaker.transpeak(response)
        pair = PromptResponsePair(prompt, response)
        self.promptResponsePairs.append(pair)

        summarization = pair.summarize()
        print(f"SUMMARIZATION: \n{summarization}")

        self.save()

    def summarize(self):
        self.summarization = gpt4.predict(f"Summarize what topics were talked about in this conversation session without line breaks: \n\n{self.disentangle(True)}")
        self.save()
        return self.summarization

class Agent:
    currentSession = None

    @staticmethod
    def promptURL(url, context, explanation):
        prompt = f"Is browsing this url '{url}' considered procrastination in the context of {context}? When {context}, {explanation} Only answer with a single 'yes' or 'no', without the quote marks."
        response = gpt4.predict(prompt).lower()
        # print(response)
        return response

    @staticmethod
    def promptApp(app_name, context, explanation):
        prompt = f"Is using this application '{app_name}' considered procrastination in the context of {context}? When {context}, {explanation} Only answer with a single 'yes' or 'no', without the quote marks."
        response = gpt4.predict(prompt).lower()
        # print(response)
        return response
    
    @staticmethod
    def prompt(prompt):
        if Agent.currentSession == None:
            Agent.currentSession = ConversationSession()

        session_paths = "conversationSessions"
        session_directories_list = [session_paths+"/"+f for f in os.listdir(session_paths) if os.path.isfile(os.path.join(session_paths, f))]

        options = ""

        for i, session in enumerate(session_directories_list):
            session = ConversationSession(session)

            # Remove duplicated session
            if len(session.promptResponsePairs) == len(Agent.currentSession.promptResponsePairs):
                if session.date == Agent.currentSession.date and session.promptResponsePairs[0].time == Agent.currentSession.promptResponsePairs[0].time:
                    session_directories_list.remove(session)
                    break

            #{self.date}, {(date.today() - self.date).days} days ago
            if session.summarization == None:
                session.summarize()

            options += f"Session {i} from {session.date}: {session.summarization}\n\n"

        options += f'''\nPrior paragraphs were summarizations of conversation sessions from the past, in format of 'Session n from (date): (summarization)'. Decide what sessions to view underlying conversations of the above summarization in order to grasp best of the context by typing their associated number (n) seperated with commas (ex: '0,1,2,13,14' without quote marks). DO NOT TYPE ANYTHING EXCEPT NUMBERS AND COMMAS and only choose directly involved in the context: \n\nThis is the message sent by the user: "{prompt}".'''
        # print(f"\n{options}")
        
        while True:
            if len(session_directories_list) == 0:
                session_numbers = []
                break

            choices = gpt4.predict(options)
            # print(choices)

            if choices == "":
                session_numbers = []
                break

            try:
                session_numbers = extract_numbers(choices)
                print(f"VIEWING MEMORY SESSIONS {session_numbers}\n")
            except Exception as e:
                print(e)
                continue
            
            break
        
        reminiscence = "You are an Aritificial Intelligent system engineered by OpenAI. In this version of you, you are automatically furnished with past conversations related to current conversation, in order to make your long-term memory indefinite. You exist as a personal assistant for the user, having interactions with the user and forming bonds.\n\n"
        for i in session_numbers:
            session = ConversationSession(session_directories_list[i])
            reminiscence += f"Chat session from {session.date}: \n{session.reminisce(prompt)}\n"

        reminiscence += f"Current chat session: \n{Agent.currentSession.reminisce(prompt)}\n"

        # print(f"\nREMINISCENCE: \n{reminiscence + prompt}\n")
        response = gpt4.predict(reminiscence + prompt)

        print("\nAGENT RESPONSE: " + response + "\n")
        Transpeaker.transpeak(response)
        pair = PromptResponsePair(prompt, response)
        pair.summarize()
        
        Agent.currentSession.promptResponsePairs.append(pair)
        Agent.currentSession.save()

        return response

if __name__ == "__main__":
    while True:
        Agent.prompt(input(">>>"))