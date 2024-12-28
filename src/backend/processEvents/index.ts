import { AzureFunction, Context } from '@azure/functions';
import { ProcessMeetingEvent, Event } from '../src/lib/events';
import { registerAzureServices } from '../src/lib/diServices';
import {
    getEventHandler as getEventHandlerClass,
    EventHandler
} from '../src/lib/events';
import Container from 'typedi';

import ProcessMeetingEventHandler from './eventHandlers/processMeetingEventHandler';

// Enable Dependency Injection
registerAzureServices(Container);

const queueTrigger: AzureFunction = function (
    context: Context,
    event: Event<any>
) {
    console.log('Queue trigger function processed work item', event);

    const handlerClass = getEventHandlerClass(event.event_name);

    if (!handlerClass) {
        throw new Error(`No handler found for event: ${event.event_name}`);
    }

    try {
        const handler = new handlerClass();
        handler.processEvent(event.data);
    } catch (error) {
        console.error('Error processing event: ', error);
        throw error;
    }
};

export default queueTrigger;
