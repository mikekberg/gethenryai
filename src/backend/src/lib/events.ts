import { MeetingInfo } from './meetingTypes';

export interface Event<T> {
    event_name: string;
    data: T;
}

export interface ProcessMeetingEvent extends Event<MeetingInfo> {
    event_name: 'process_meeting';
}

export abstract class EventHandler<T> {
    public abstract processEvent(eventData: T): Promise<void>;
}

const eventHandlerRegistry: { [key: string]: any } = {};

export function RegisterEventHandler(eventType: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        eventHandlerRegistry[eventType] = new constructor();
    };
}

export function getEventHandlerClass<
    T extends { new (...args: any[]): EventHandler<any> }
>(eventType: string): T {
    return eventHandlerRegistry[eventType];
}
