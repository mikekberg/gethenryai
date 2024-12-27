import {
    Get,
    JsonController,
    Req,
    Post,
    UploadedFile,
    UseBefore
} from 'routing-controllers';
import { TableClient } from '@azure/data-tables';
import {
    BlobSASPermissions,
    BlobServiceClient,
    ContainerClient
} from '@azure/storage-blob';
import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AuthObjectsMiddleware from '../middleware/authObjectsMiddleware';
import { auth } from 'express-oauth2-jwt-bearer';
import { ProcessMeetingEvent, ProcessMeetingData } from '../lib/events';
import {
    MulterAzureStorage,
    MASNameResolver,
    MulterOutFile
} from 'multer-azure-blob-storage';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import multipart from 'parse-multipart';
import { HttpRequest } from '@azure/functions';

if (process.env.AZURE_STORAGE_CONNECTION_STRING === undefined) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
}

const resolveBlobName: MASNameResolver = (
    req: any,
    file: Express.Multer.File
): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const blobName: string = file.filename || file.originalname;
        resolve(blobName);
    });
};

const azureStorage: MulterAzureStorage = new MulterAzureStorage({
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: 'meetingaudio',
    blobName: resolveBlobName
});

@JsonController('/meetings')
@UseBefore(
    auth({
        issuerBaseURL: `https://henryai.ca.auth0.com`,
        audience: 'https://api.gethenryai.com'
    }),
    AuthObjectsMiddleware
)
export class MeetingInfoController {
    private static readonly MEETING_TABLE_NAME = 'meetings';

    private azureMeetingTableClient: TableClient;
    private processMeetingQueue: QueueClient;
    private meetingAudioBlobClient: ContainerClient;

    constructor() {
        if (process.env.AZURE_TABLES_CONNECTION_STRING === undefined) {
            throw new Error('AZURE_TABLES_CONNECTION_STRING is not set');
        }

        if (process.env.AZURE_STORAGE_CONNECTION_STRING === undefined) {
            throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
        }

        if (process.env.AZURE_QUEUE_CONNECTION_STRING === undefined) {
            throw new Error('AZURE_QUEUE_CONNECTION_STRING is not set');
        }

        this.azureMeetingTableClient = TableClient.fromConnectionString(
            process.env.AZURE_TABLES_CONNECTION_STRING,
            MeetingInfoController.MEETING_TABLE_NAME
        );

        this.processMeetingQueue = QueueServiceClient.fromConnectionString(
            process.env.AZURE_QUEUE_CONNECTION_STRING
        ).getQueueClient('events');

        this.meetingAudioBlobClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        ).getContainerClient('meetingaudio');
    }

    private async queueProcessMeetingEvent(data: ProcessMeetingData) {
        const event: ProcessMeetingEvent = {
            event_name: 'process_meeting',
            data
        };

        await this.processMeetingQueue.sendMessage(btoa(JSON.stringify(event)));
    }

    @Get('/')
    public async getMeetings(@Req() request: Request) {
        const meetings = await this.azureMeetingTableClient.listEntities({
            queryOptions: {
                filter: `userId eq '${request.auth?.payload.sub}'`
            }
        });

        const meetingList: any[] = [];

        for await (const meeting of meetings) {
            meetingList.push({
                id: meeting.rowKey,
                audioFileUrl: meeting.audioFileUrl,
                calendarEventId: meeting.calendarEventId,
                timeStamp: meeting.timestamp
            });
        }

        return meetingList;
    }

    @Get('/generate-upload-url')
    public async generateDownloadUrl(@Req() request: Request) {
        if (request.auth?.payload.sub === undefined) {
            throw new Error('User ID not found in request');
        }

        const userId = request.auth?.payload.sub;
        const meetingId = uuidv4();
        const blobClient = this.meetingAudioBlobClient.getBlockBlobClient(
            `${userId}/${meetingId}.wav`
        );

        const uploadUrl = await blobClient.generateSasUrl({
            permissions: BlobSASPermissions.parse('rw'),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000)
        });

        return {
            meetingId,
            uploadUrl
        };
    }

    @Post('/create')
    public async createMeeting(
        @Req() request: Request,
        @UploadedFile('audioFile', {
            options: { storage: multer.memoryStorage() }
        })
        file: MulterOutFile
    ) {
        if (request.auth?.payload.sub === undefined) {
            throw new Error('User ID not found in request');
        }
        const id = uuidv4();
        var fileBuffer: Buffer;

        if (process.env.FUNCTIONS_WORKER_RUNTIME) {
            const bodyBuffer = Buffer.from(request.body);
            const boundary = multipart.getBoundary(
                request.headers['content-type'] || ''
            );
            // parse the body
            const parts = multipart.Parse(bodyBuffer, boundary);

            console.log(parts);

            throw new Error('Not implemented');
        } else {
            fileBuffer = file.buffer;
        }

        await this.meetingAudioBlobClient
            .getBlockBlobClient(
                file.filename || file.originalname || 'test.wav'
            )
            .uploadData(fileBuffer);

        await this.azureMeetingTableClient.createEntity({
            partitionKey: request.auth?.payload.sub,
            userId: request.auth?.payload.sub,
            rowKey: id,
            audioFileUrl: file.url,
            calendarEventId: ''
        });

        /*await this.queueProcessMeetingEvent({
            meeting_id: id,
            audio_url: file.url
        });*/

        return {
            message: 'Meeting created',
            audioFileUrl: file.url,
            id
        };
    }
}
