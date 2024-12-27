class MeetingRecorder {
    private recordedChunks: Blob[] = [];
    private streamOptions = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm'
    };
    private mediaRecorder?: MediaRecorder;
    private isRecording = false;

    private streams: MediaStream[] = [];

    public onRecordingReady?: (recordedAudio: File) => Promise<void>;

    public async startRecording() {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true // This captures system audio if available
        });

        const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        this.streams.push(screenStream);
        this.streams.push(micStream);

        const combinedStream = new MediaStream([
            ...this.mergeAudioStreams(screenStream, micStream).getTracks()
        ]);

        screenStream.getTracks()[0].onended = () => {
            this.mediaRecorder?.stop();
        };

        this.mediaRecorder = new MediaRecorder(
            combinedStream,
            this.streamOptions
        );

        this.mediaRecorder.ondataavailable =
            this.onMediaRecorderDataAvailable.bind(this);

        this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    public registerOnRecordingReady(
        callback: (recordedAudio: File) => Promise<void>
    ) {
        this.onRecordingReady = callback;
    }

    public stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    private onMediaRecorderDataAvailable(event: BlobEvent) {
        if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
        }
    }

    private onMediaRecorderStop() {
        if (this.onRecordingReady) {
            this.onRecordingReady(
                new File(this.recordedChunks, `${Date.now()}.webm`, {
                    type: 'audio/webm'
                })
            ).then(() => {
                this.recordedChunks = [];
            });
        }

        this.streams.forEach((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        });

        this.streams = [];

        this.isRecording = false;
    }

    private mergeAudioStreams(
        screenStream: MediaStream,
        micStream: MediaStream
    ) {
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

export default new MeetingRecorder();
