import {
    MEETINGAUDIO_AZURE_CONTAINER,
    MeetingInfo
} from '../../src/lib/meetingTypes';
import OpenAI from 'openai';
import { BlobServiceClient } from '@azure/storage-blob';
import { Service } from 'typedi';
import { AIService } from 'src/services/aiService';
import { EventHandler, RegisterEventHandler } from 'src/lib/events';

const FileClass = globalThis.File;

@Service()
@RegisterEventHandler('process_meeting')
export default class ProcessMeetingEventHandler extends EventHandler<MeetingInfo> {
    constructor(private aiService: AIService) {
        super();
    }

    private async streamToBuffer(
        readable: NodeJS.ReadableStream
    ): Promise<Buffer> {
        const chunks: Buffer[] = [];
        for await (const chunk of readable) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        return Buffer.concat(chunks);
    }

    public async processEvent(data: MeetingInfo) {
        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
            throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
        }
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set');
        }
        console.log('Processing meeting', data);

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        const openAIClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const blobClient = blobServiceClient
            .getContainerClient(MEETINGAUDIO_AZURE_CONTAINER)
            .getBlockBlobClient(data.audioFile);

        const downloadResponse = await blobClient.download(0);

        if (!downloadResponse.readableStreamBody) {
            throw new Error(
                'No readable stream body found on the download response.'
            );
        }
        const audioBuffer = await this.streamToBuffer(
            downloadResponse.readableStreamBody
        );

        const file = new FileClass([audioBuffer], 'meeting.mp3', {
            type: 'audio/mpeg' // or the correct MIME type
        });

        const transcription = await openAIClient.audio.transcriptions.create({
            file,
            model: 'whisper-1'
        });

        console.log('Transcription:', transcription);
    }
}
