import json
from langchain.chat_models import ChatOpenAI

from dotenv import load_dotenv
import os
from datetime import date

from transpeaker import Transpeaker
#FIXME: 안녕
load_dotenv()
api_key = os.getenv('OPENAI_KEY')
llm = ChatOpenAI(openai_api_key=api_key, model_name='gpt-4')

class PromptResponsePair:
    def __init__(self, humanMessage, AIMessage):
        self.humanMessage = humanMessage
        self.AIMessage = AIMessage
        self.summarization = f"User: {self.humanMessage}\nYou: {self.AIMessage}\n"

    def disentangle(self):
        return f"User: {self.humanMessage}\nYou: {self.AIMessage}\n"
    
    def summarize(self):
        self.summarization = llm.predict(f"Summarize in a single short sentence what this 'user message - your message pair' talks about, distinguishing between user's message and your message: \n{self.disentangle()}") + "\n"
        return self.summarization
    
    def to_dict(self):
        return {
            'humanMessage': self.humanMessage,
            'AIMessage': self.AIMessage,
            'summarization': self.summarization
        }

    @staticmethod
    def from_dict(data):
        pair = PromptResponsePair(data['humanMessage'], data['AIMessage'])
        pair.summarization = data['summarization']
        return pair

class ConversationSession:
    def __init__(self, save_path = None):
        if save_path == None:
            self.promptResponsePairs = []
            self.date = date.today()
        else:
            with open(save_path, 'r') as f:
                data = json.load(f)
                self.date = date.fromisoformat(data['date'])
                self.promptResponsePairs = [PromptResponsePair.from_dict(pair) for pair in data['promptResponsePairs']]

                print(self.disentangle(False)) 

    def save(self, save_path):
        with open(save_path, 'w') as f:
            json.dump({
                'date': self.date.isoformat(),
                'promptResponsePairs': [pair.to_dict() for pair in self.promptResponsePairs]
            }, f, indent=4)

    def reminisce(self, prompt):
        if self.promptResponsePairs == []:
            return ""

        while True:
            summarized = self.disentangle(False)
            reminiscence = f'''This is the message sent by the user: "{prompt}".\n\nFollowing is a detailed summarization of a conversation session from {self.date}, {(date.today() - self.date).days} days ago, in format of 'Pair n: Summarization'. Decide what pairs to view underlying conversations below the summarization by typing their associated number (n) seperated with commas (ex: '0,1,2,3,13,14' without quote marks). Do not type anything except numbers and commas: \n\n{summarized}'''
            response = llm.predict(reminiscence).strip()
            
            if response == "":
                pair_numbers = []
                break

            try:
                pair_numbers = list(map(int, response.split(",")))
            except Exception as e:
                print(e)
                continue
            
            break

        reminiscence = ""
        for i, pair in enumerate(self.promptResponsePairs):
            if i in pair_numbers:
                # reminiscence += f'Pair {i} (viewing details): '
                reminiscence += pair.disentangle()
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

        return disentangled

    def prompt(self, prompt):
        pseudo_system = "(You are an autonomous intelligent )"
        reminiscence = self.reminisce(prompt)
        print('\n' + reminiscence + prompt + '\n')
        response = llm.predict(reminiscence + prompt)
        print(response)
        Transpeaker.transpeak(response)
        pair = PromptResponsePair(prompt, response)
        self.promptResponsePairs.append(pair)

        summarization = pair.summarize()
        print(f"\n{summarization}")

        self.save("conversationSessions/temp")

class Agent:
    @staticmethod
    def promptURL(url, context, explanation):
        prompt = f"Is browsing this url '{url}' considered procrastination in the context of {context}? When {context}, {explanation} Only answer with a single 'yes' or 'no', without the quote marks."
        response = llm.predict(prompt).lower()
        print(response)
        return response

    @staticmethod
    def promptApp(app_name, context, explanation):
        prompt = f"Is using this application '{app_name}' considered procrastination in the context of {context}? When {context}, {explanation} Only answer with a single 'yes' or 'no', without the quote marks."
        response = llm.predict(prompt).lower()
        print(response)
        return response

if __name__ == "__main__":
    memory_path = "conversationSessions/temp" if os.path.isfile("conversationSessions/temp") else None

    session = ConversationSession()
    while True:
        session.prompt(input(">>>"))