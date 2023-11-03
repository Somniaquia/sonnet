import assemblyai as aai
from dotenv import load_dotenv
import os
import time

load_dotenv()
aai.settings.api_key = os.getenv('ASSEMBLYAI_KEY')
silence_time = 0
previous_time = time.time_ns() / (10 ** 9)

def on_open(session_opened: aai.RealtimeSessionOpened):
	"This function is called when the connection has been established."
	print("Session ID:", session_opened.session_id)

def on_data(transcript: aai.RealtimeTranscript):
	"This function is called when a new transcript has been received."
	global silence_time, previous_time
	if not transcript.text:
		silence_time += time.time_ns() / (10 ** 9) - previous_time
	
	previous_time = time.time_ns() / (10 ** 9)

	if isinstance(transcript, aai.RealtimeFinalTranscript):
		silence_time = 0
		print(transcript.text, end="\r\n")
	else:
		print(transcript.text, end="\r")

def on_error(error: aai.RealtimeError):
	"This function is called when the connection has been closed."

	print("An error occured:", error)

def on_close():
	"This function is called when the connection has been closed."
	print("Closing Session")

transcriber = aai.RealtimeTranscriber(
	on_data=on_data,
	on_error=on_error,
	sample_rate=44_100,
	on_open=on_open,
	on_close=on_close,
)

transcriber.connect()

microphone_stream = aai.extras.MicrophoneStream()
transcriber.stream(microphone_stream)

transcriber.close()