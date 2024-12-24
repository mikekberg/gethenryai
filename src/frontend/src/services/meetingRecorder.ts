export class MeetingRecorder {
  private recordedChunks: Blob[] = [];
  private streamOptions = {
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm",
  };
  private mediaRecorder?: MediaRecorder;
  private isRecording = false;

  public onRecordingReady?: (data: Blob) => void;

  public async startRecording() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true, // This captures system audio if available
    });

    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const combinedStream = new MediaStream([
      ...this.mergeAudioStreams(screenStream, micStream).getTracks(),
    ]);

    this.mediaRecorder = new MediaRecorder(combinedStream, this.streamOptions);

    this.mediaRecorder.ondataavailable =
      this.onMediaRecorderDataAvailable.bind(this);

    this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  private onMediaRecorderDataAvailable(event: BlobEvent) {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  private onMediaRecorderStop() {
    if (this.onRecordingReady) {
      this.onRecordingReady(
        new Blob(this.recordedChunks, { type: "audio/webm" })
      );
    }

    this.isRecording = false;
  }

  private mergeAudioStreams(screenStream: MediaStream, micStream: MediaStream) {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();

    if (screenStream.getAudioTracks().length > 0) {
      const sourceScreen = context.createMediaStreamSource(screenStream);
      sourceScreen.connect(destination);
    }

    const sourceMic = context.createMediaStreamSource(micStream);
    sourceMic.connect(destination);

    return destination.stream;
  }
}
