from flask import Flask, render_template, request, jsonify
from speech_recognition import Recognizer, Microphone, RequestError, UnknownValueError, WaitTimeoutError
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Google Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

app = Flask(__name__)
recognizer = Recognizer()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-recording', methods=['POST'])
def start_recording():
    try:
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error starting recording: {str(e)}")
        return jsonify({"success": False, "error": str(e)})

@app.route('/stop-recording', methods=['POST'])
def stop_recording():
    try:
        with Microphone() as source:
            print("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=2)
            
            recognizer.energy_threshold = 300
            recognizer.dynamic_energy_threshold = True
            
            print("Listening...")
            audio = recognizer.listen(source, 
                                    timeout=None, 
                                    phrase_time_limit=15)
            
        try:
            print("Recognizing...")
            text = recognizer.recognize_google(audio)
            print(f"Recognized text: {text}")
            
            # Send to Gemini
            response = model.generate_content(text)
            
            return jsonify({
                "success": True,
                "text": text,
                "response": response.text
            })
        except UnknownValueError:
            return jsonify({"success": False, "error": "Could not understand audio. Please speak clearly and try again."})
        except RequestError as e:
            return jsonify({"success": False, "error": f"Could not request results; {str(e)}"})
        except WaitTimeoutError:
            return jsonify({"success": False, "error": "No speech detected. Please try again."})
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
