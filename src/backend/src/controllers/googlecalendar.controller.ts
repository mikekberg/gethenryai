import { Get, Req, JsonController, Authorized } from 'routing-controllers';
import { google } from 'googleapis';
import { Request } from 'express';

@JsonController('/gcal')
@Authorized()
export class GoogleCalendarController {
    @Get('/events')
    public async getEvents(@Req() request: Request) {
        if (!request.googleAuthClient) {
            throw new Error('Unable to get google Auth client');
        }

        const calendar = google.calendar({
            version: 'v3',
            auth: request.googleAuthClient
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
