export interface MeetingInsights {
    summary: string;
    executiveSummary: string;
    actionItems: string[];
}

export interface MeetingInfo {
    id: string;
    userId: string;
    audioFile: string;
    calendarEventId: string;
    state: 'processing' | 'ready';
    transcript?: string;
    insights?: MeetingInsights;
}

export const MEETINGAUDIO_AZURE_CONTAINER = 'meetingaudio';
export const MEETING_TABLE_NAME = 'meetings';
export const EVENT_QUEUE_NAME = 'events';
