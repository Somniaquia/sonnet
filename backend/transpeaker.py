import time
import pyttsx3
import re
import unicodedata
from pydub import AudioSegment
from pydub.silence import detect_silence
from pydub.playback import play
import threading

engine = pyttsx3.init()

engine.setProperty('rate', 200)
engine.setProperty('volume', 1.0)
voices = engine.getProperty('voices')

ENGLISH_VOICE_ID = voices[0].id
KOREAN_VOICE_ID = voices[1].id

class Transpeaker:
    @staticmethod
    def split_text(text):
        lang_patterns = {
            'latin': r'[a-zA-Z]',
            'hangul': r'[\uac00-\ud7af]',
        }
        
        other_chars = r'[^\uac00-\ud7a3a-zA-Z]'
        all_patterns = '|'.join(lang_patterns.values()) + '|' + other_chars

        matches = re.finditer(all_patterns, text, re.UNICODE)

        segments = []
        current_segment = ''
        current_lang = None

        for match in matches:
            char = match.group(0)
            char_lang = next((lang for lang, pattern in lang_patterns.items() if re.match(pattern, char)), 'other')

            if current_lang is not None and char_lang != current_lang and char_lang != 'other':
                segments.append(current_segment)
                current_segment = char
            else:
                current_segment += char

            current_lang = char_lang if char_lang != 'other' else current_lang

        if current_segment:
            segments.append(current_segment)

        return segments

    @staticmethod
    def play_audio(audio_segment):
        play(audio_segment)

    @staticmethod
    def is_korean_segment(text):
        return bool(re.search("[\uac00-\ud7a3]", text))

    @staticmethod
    def transpeak(prompt):
        segments = Transpeaker.split_text(prompt)
        combined = AudioSegment.empty()

        for i, segment in enumerate(segments):
            if Transpeaker.is_korean_segment(segment):
                engine.setProperty('voice', KOREAN_VOICE_ID)
                engine.setProperty('rate', 250)

            else:
                engine.setProperty('voice', ENGLISH_VOICE_ID)
                engine.setProperty('rate', 200)
            
            temp_filename = f'transpeaks/temp_segment_{i}.wav'
            
            engine.save_to_file(segment.strip(), temp_filename)
            engine.runAndWait()
            
            sound = AudioSegment.from_file(temp_filename, format="wav")
            silence_thresh = sound.dBFS - 14
            silences = detect_silence(sound, min_silence_len=100, silence_thresh=silence_thresh)
            
            if silences:
                last_silence_start = silences[-1][0]
                sound = sound[:last_silence_start + 100]
            
            combined += sound
        
        combined.export('transpeaks/temp_combined.mp3', format='mp3')

        engine.stop()
        combined_audio = AudioSegment.from_file('transpeaks/temp_combined.mp3', format="mp3")
        
        play_thread = threading.Thread(target=Transpeaker.play_audio, args=(combined_audio,))
        play_thread.start()

if __name__ == "__main__":
    Transpeaker.transpeak("Hello, my name is OpenAI. 어떻게 도와드릴까요?")