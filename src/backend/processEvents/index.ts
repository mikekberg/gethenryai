import { AzureFunction, Context } from '@azure/functions';
import { ProcessMeetingEvent, Event } from '../src/lib/events';
import processMeetingEventHandler from '../src/eventHandlers/processMeetingEventHandler';

const queueTrigger: AzureFunction = function (
    context: Context,
    event: Event<any>
) {
    console.log('Queue trigger function processed work item', event);

    try {
        switch (event.event_name) {
            case 'process_meeting':
                processMeetingEventHandler(event.data);
                break;
            default:
                throw new Error(`Unknown event type: ${event.event_name}`);
        }
    } catch (error) {
        console.error('Error processing event: ', error);
        throw error;
    }
};

export default queueTrigger;
