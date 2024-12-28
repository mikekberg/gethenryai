import {
    Get,
    JsonController,
    Req,
    UseBefore,
    Param,
    QueryParam,
    Authorized
} from 'routing-controllers';
import {
    BlobSASPermissions,
    BlobServiceClient,
    ContainerClient
} from '@azure/storage-blob';
import { TableClient } from '@azure/data-tables';
import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ProcessMeetingEvent } from '../lib/events';
import {
    MEETINGAUDIO_AZURE_CONTAINER,
    MeetingInfo
} from 'src/lib/meetingTypes';

@JsonController('/meetings')
@Authorized()
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
        ).getContainerClient(MEETINGAUDIO_AZURE_CONTAINER);
    }

    private async queueProcessMeetingEvent(data: MeetingInfo) {
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

    @Get('/create/:id')
    public async createMeeting(
        @Param('id') id: string,
        @QueryParam('calendarEventId', { required: false })
        calendarEventId: string,
        @Req() request: Request
    ) {
        if (request.auth?.payload.sub === undefined) {
            throw new Error('User ID not found in request');
        }

        const userId = request.auth?.payload.sub;
        const audioFile = `${userId}/${id}.wav`;

        if (
            !(await this.meetingAudioBlobClient
                .getBlobClient(audioFile)
                .exists())
        ) {
            throw new Error(
                'Unable to create meeting, Audio file not uploaded.'
            );
        }

        const meetingInfo: MeetingInfo = {
            id,
            userId,
            audioFile,
            calendarEventId,
            state: 'processing'
        };

        await this.azureMeetingTableClient.createEntity({
            rowKey: meetingInfo.id,
            partitionKey: userId,
            ...meetingInfo
        });

        await this.queueProcessMeetingEvent(meetingInfo);

        return {
            message: 'Meeting created',
            data: meetingInfo
        };
    }
}
