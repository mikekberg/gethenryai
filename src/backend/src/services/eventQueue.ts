import { QueueClient } from '@azure/storage-queue';
import { ProcessMeetingEvent, Event } from 'src/lib/events';
import { MeetingInfo } from 'src/lib/meetingTypes';
import { Service } from 'typedi';

@Service()
export class EventQueue {
    constructor(private eventQueue: QueueClient) {}

    public async processMeeting(data: MeetingInfo) {
        await this.sendMessage({
            event_name: 'process_meeting',
            data
        });
    }

    private async sendMessage<T>(event: Event<T>) {
        await this.eventQueue.sendMessage(btoa(JSON.stringify(event)));
    }
}
