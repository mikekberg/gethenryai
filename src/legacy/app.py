from flask import Flask, request, jsonify, render_template, send_from_directory
import os, openai, json

app = Flask(__name__)

# Read the API key from the file
with open('registry', 'r') as file:
    api_key = file.read().strip()

# Set the API key
openai.api_key = api_key

# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')  # Assuming you have an index.html file

# Folder to save audio files
UPLOAD_FOLDER = './data/tmp'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audioFile' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    audio_file = request.files['audioFile']
    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)

    return jsonify({'transcription': "File saved successfully"})

    pass

# Serve transcription and summary files from the data folder
@app.route('/data/<folder>/<filename>')
def serve_file(folder, filename):
    return send_from_directory(f'./data/{folder}', filename)

@app.route('/get-folders')
def get_folders():
    data_dir = './data'
    folders = [f for f in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, f)) and f != 'tmp']
    return jsonify(folders)

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data['question']
    transcript = data['transcript']

    # Send the transcript and question to OpenAI API
    prompt = (
        f"I have some questions about what happened in this meeting, I will provide the transcript. Please format the response using html tags that you would find within the <body> of an html page. Include tags like <p> for a paragraph, <br> for line breaks, <li> and <ul> for structured lists, <strong> for bold text, etc. Don't include html tags that wouldn't be within the body, for example <html> <body> <head>. My question is {question}."
        f"Here is the full transcript: {transcript}\n\n"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",  # You can use "gpt-3.5-turbo" if you don't have access to GPT-4
        messages=[
            {"role": "system", "content": "You are an exceptional, detail oriented executive assistant"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=4096  # Adjust this based on how verbose you want the summary to be
    )

    answer = response.choices[0].message.content.strip()

    return jsonify({'answer': answer})

# Folder where transcript, summary, and chat files are stored
DATA_FOLDER = './data'

# Load chat history from chat.txt
@app.route('/load-chat', methods=['GET'])
def load_chat():
    folder = request.args.get('folder')
    chat_file = os.path.join(DATA_FOLDER, folder, 'chat.txt')
    
    if os.path.exists(chat_file):
        with open(chat_file, 'r') as f:
            chat_history = json.load(f)
    else:
        chat_history = []

    return jsonify({'chat_history': chat_history})

# Save new chat message to chat.txt in JSON format
@app.route('/save-chat', methods=['POST'])
def save_chat():
    data = request.json
    folder = data['folder']
    sender = data['sender']
    message = data['message']

    chat_file = os.path.join(DATA_FOLDER, folder, 'chat.txt')

    # Load existing chat history if the file exists
    if os.path.exists(chat_file):
        with open(chat_file, 'r') as f:
            chat_history = json.load(f)
    else:
        chat_history = []

    # Append the new message to the chat history
    chat_history.append({'sender': sender, 'message': message})

    # Save the updated chat history back to the file
    with open(chat_file, 'w') as f:
        json.dump(chat_history, f)

    return jsonify({'status': 'Message saved'})

if __name__ == '__main__':
    app.run(debug=True)
