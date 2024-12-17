import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
from pydub import AudioSegment
import openai

# Read the API key from the file
with open('registry', 'r') as file:
    api_key = file.read().strip()

# Set the API key
openai.api_key = api_key

# Verify the API key is set
print("API key set successfully.")

class Watcher:
    DIRECTORY_TO_WATCH = "./data/tmp"
    print(f"Starting watcher in directory {DIRECTORY_TO_WATCH}")

    def __init__(self):
        self.observer = Observer()

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=False)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except KeyboardInterrupt:
            self.observer.stop()
        self.observer.join()

class Handler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f'New file detected: {event.src_path}')
            transcribe_audio(event.src_path)

def transcribe_audio(file_path):
    print(f'Beginning transcription for {file_path}...')
    filename = os.path.splitext(os.path.basename(file_path))[0]
    output_dir = f'./data/{filename}'
    output_path = f'{output_dir}/transcription.txt'
    summary_path = f'{output_dir}/summary.txt'

    os.makedirs(output_dir, exist_ok=True)

    # Split the audio into chunks if necessary (max 20MB per chunk), saving chunks in output_dir
    chunk_paths = split_audio(file_path, chunk_size_mb=20, output_dir=output_dir)
    
    if not chunk_paths:
        print(f"No chunks were created from {file_path}. Check the audio file.")
        return

    full_transcription = "<h2>Full transcript...</h2>"

    for chunk_path in chunk_paths:
        if not os.path.exists(chunk_path):
            print(f"Chunk file {chunk_path} not found!")
            continue
        
        with open(chunk_path, 'rb') as audio_file:
            try:
                # Transcribe each chunk using Whisper API
                transcription = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                # Append the transcription result
                full_transcription += transcription.text + '\n'

            except Exception as e:
                print(f"Error during transcription of {chunk_path}: {e}")

        # Clean up the chunk file after processing
        os.remove(chunk_path)

    # Write the full transcription to the output file
    with open(output_path, 'w') as f:
        f.write(full_transcription)
    
    print(f"Transcription saved to {output_path}")

    #Now create the summary
    try:
        summary = generate_summary(full_transcription)
        with open(summary_path, 'w') as f:
            f.write(summary)
        print(f"Summary saved to {summary_path}")
    except Exception as e:
        print(f"Error generating summary: {e}")

def generate_summary(transcription_text):
    print("Generating summary...")

    prompt = (
        "Please provide an extremely verbose summary of this meeting ensuring every item and detail discussed is included in the summary. Also provide a 200 word executive summary at the beginning. After the executive summary provide a list of the action items I committed to and what action items were committed to by others if any. After the action items section begin the extremely verbose summary. Use the following headers for these sections: Executive Summary, Action Items, Full Meeting Summary. Please format the response using html tags that you would find within the <body> of an html page. Include tags like <p> for a paragraph, <br> for line breaks, <li> and <ul> for structured lists, <strong> for bold text, etc. Don't include html tags that wouldn't be within the body, for example <html> <body> <head>. Limit your response including all sections to no more than 2950 words. Here is the transcript of the meeting:\n\n"
        f"{transcription_text}\n\n"
        "Summary:"
    )

    response = openai.chat.completions.create(
        model="gpt-4o",  # You can use "gpt-3.5-turbo" if you don't have access to GPT-4
        messages=[
            {"role": "system", "content": "You are an exceptional, detail oriented executive assistant responsible for summarize my meetings including action items"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=4096  # Adjust this based on how verbose you want the summary to be
    )
    summary = response.choices[0].message.content.strip()

    return summary

def split_audio(file_path, chunk_size_mb=20, output_dir="./data"):
    try:
        audio = AudioSegment.from_file(file_path)
    except Exception as e:
        print(f"Error loading audio file {file_path}: {e}")
        return []

    chunk_size_bytes = chunk_size_mb * 1024 * 1024
    duration_ms = len(audio)

    # Calculate how long each chunk should be (in milliseconds)
    byte_rate = (audio.frame_rate * audio.frame_width * audio.channels) / 8
    chunk_duration_ms = (chunk_size_bytes / byte_rate) * 1000

    chunks = [audio[i:i + int(chunk_duration_ms)] for i in range(0, duration_ms, int(chunk_duration_ms))]
    chunk_paths = []

    for idx, chunk in enumerate(chunks):
        if len(chunk) < 1000:  # Discard chunks shorter than 1 second
            continue

        chunk_path = f"{output_dir}/{os.path.splitext(os.path.basename(file_path))[0]}_chunk{idx}.mp3"
        try:
            chunk.export(chunk_path, format="mp3")
            if os.path.exists(chunk_path):  # Verify the chunk was exported
                chunk_paths.append(chunk_path)
                print(f"Chunk {chunk_path} created successfully.")
            else:
                print(f"Failed to create chunk: {chunk_path}")
        except Exception as e:
            print(f"Error exporting chunk {idx}: {e}")

    return chunk_paths

if __name__ == "__main__":
    watcher = Watcher()
    watcher.run()
