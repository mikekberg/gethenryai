export interface Event<T> {
    event_name: string;
    data: T;
}

export interface ProcessMeetingData {
    meeting_id: string;
    audio_url: string;
}

export interface ProcessMeetingEvent extends Event<ProcessMeetingData> {
    event_name: 'process_meeting';
}
