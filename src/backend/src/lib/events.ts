import { MeetingInfo } from './meetingTypes';

export interface Event<T> {
    event_name: string;
    data: T;
}

export interface ProcessMeetingEvent extends Event<MeetingInfo> {
    event_name: 'process_meeting';
}
