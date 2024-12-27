import { ProcessMeetingData } from '../lib/events';
import OpenAI from 'openai';
import { BlobServiceClient, BlobClient } from '@azure/storage-blob';
import { Readable } from 'stream';

const FileClass = globalThis.File;

export async function streamToBuffer(
    readable: NodeJS.ReadableStream
): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

function parseContainerAndBlobName(blobUrl: string): {
    containerName: string;
    blobName: string;
} {
    const url = new URL(blobUrl);
    const pathParts = url.pathname.slice(1).split('/');
    const containerName = pathParts.shift() ?? '';
    const blobName = pathParts.join('/');

    return { containerName, blobName };
}

export default async function ProcessMeetingEventHandler(
    data: ProcessMeetingData
) {
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
    const { containerName, blobName } = parseContainerAndBlobName(
        data.audio_url
    );

    console.log('Container name:', containerName);
    console.log('Blob name:', blobName);

    const blobClient = blobServiceClient
        .getContainerClient(containerName)
        .getBlockBlobClient(blobName);

    const downloadResponse = await blobClient.download(0);

    if (!downloadResponse.readableStreamBody) {
        throw new Error(
            'No readable stream body found on the download response.'
        );
    }
    const audioBuffer = await streamToBuffer(
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
