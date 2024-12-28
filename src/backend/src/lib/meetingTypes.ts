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
