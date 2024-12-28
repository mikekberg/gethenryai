import {
    Get,
    Req,
    JsonController,
    Authorized,
    CurrentUser
} from 'routing-controllers';
import { google } from 'googleapis';
import { Request } from 'express';
import { Service } from 'typedi';
import User from 'src/lib/user';

@Service()
@JsonController('/gcal')
@Authorized()
export class GoogleCalendarController {
    constructor() {}

    @Get('/events')
    public async getEvents(
        @Req() request: Request,
        @CurrentUser({ required: true }) user: User
    ) {
        const calendar = google.calendar({
            version: 'v3',
            auth: user.googleAuthClient
        });

        // Fetch the list of upcoming events
        const response = await calendar.events.list({
            calendarId: 'primary', // The user's primary calendar
            timeMin: new Date().toISOString(), // Events from now onwards
            maxResults: 10, // Fetch up to 10 events
            singleEvents: true, // Expand recurring events
            orderBy: 'startTime' // Order events by start time
        });

        // Return the list of events
        return response.data.items || null;
    }
}
