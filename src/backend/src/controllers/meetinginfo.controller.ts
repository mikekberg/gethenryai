import {
    Get,
    JsonController,
    Param,
    QueryParam,
    Authorized,
    CurrentUser
} from 'routing-controllers';
import { BlobSASPermissions, ContainerClient } from '@azure/storage-blob';
import { TableClient, TableServiceClient } from '@azure/data-tables';
import { v4 as uuidv4 } from 'uuid';
import { MeetingInfo } from 'src/lib/meetingTypes';
import { Service } from 'typedi';
import User from 'src/lib/user';
import { EventQueue } from 'src/services/eventQueue';

@Service()
@JsonController('/meetings')
@Authorized()
export class MeetingInfoController {
    constructor(
        private meetingsTable: TableClient,
        private eventQueue: EventQueue,
        private meetingAudioContainerClient: ContainerClient
    ) {}

    @Get('/')
    public async getMeetings(@CurrentUser() user: User) {
        const meetings = await this.meetingsTable.listEntities({
            queryOptions: {
                filter: `userId eq '${user.userId}'`
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
    public async generateDownloadUrl(@CurrentUser() user: User) {
        const meetingId = uuidv4();

        const blobClient = this.meetingAudioContainerClient.getBlobClient(
            `${user.userId}/${meetingId}`
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
        @CurrentUser() user: User
    ) {
        const audioFile = `${user.userId}/${id}.wav`;

        if (
            !(await this.meetingAudioContainerClient
                .getBlobClient(audioFile)
                .exists())
        ) {
            throw new Error(
                'Unable to create meeting, Audio file not uploaded.'
            );
        }

        const meetingInfo: MeetingInfo = {
            id,
            userId: user.userId,
            audioFile,
            calendarEventId,
            state: 'processing'
        };

        await this.meetingsTable.createEntity({
            rowKey: meetingInfo.id,
            partitionKey: user.userId,
            ...meetingInfo
        });

        await this.eventQueue.processMeeting(meetingInfo);

        return {
            message: 'Meeting created',
            data: meetingInfo
        };
    }
}
