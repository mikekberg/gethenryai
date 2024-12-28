import 'reflect-metadata';

import { Application } from 'express';
import { registerAzureServices } from './lib/diServices';
import { createExpressServer, useContainer } from 'routing-controllers';
import { GoogleCalendarController } from './controllers/googlecalendar.controller';
import { PingController } from './controllers/ping.controller';
import { MeetingInfoController } from './controllers/meetinginfo.controller';
import { Container } from 'typedi';
import AuthManagementService, {
    auth0AuthChecker,
    currentUserChecker
} from './services/authManagementService';
import { ManagementClient } from 'auth0';

// Enable Dependency Injection
useContainer(Container);

export interface HenryAPIServerConfig {
    port?: number;
    routePrefix?: string;
}

export default class HenryAPIServer {
    public app: Application;

    constructor(public config: HenryAPIServerConfig = {}) {
        this.config.port = config.port || Number(process.env.port) || 3000;

        this.initServices(Container);
        this.app = this.createApp(config);
    }

    private initServices(container: typeof Container) {
        // Check for required environment variables
        if (!process.env.AUTH0_DOMAIN) {
            throw new Error('Environment variable AUTH0_DOMAIN is missing');
        }
        if (!process.env.AUTH0_CLIENT_ID) {
            throw new Error('Environment variable AUTH0_CLIENT_ID is missing');
        }
        if (!process.env.AUTH0_CLIENT_SECRET) {
            throw new Error(
                'Environment variable AUTH0_CLIENT_SECRET is missing'
            );
        }

        registerAzureServices(container);

        // Register services
        container.set(
            ManagementClient,
            new ManagementClient({
                domain: process.env.AUTH0_DOMAIN,
                clientId: process.env.AUTH0_CLIENT_ID,
                clientSecret: process.env.AUTH0_CLIENT_SECRET
            })
        );

        container.set(HenryAPIServer, this);
    }

    private createApp(config: HenryAPIServerConfig) {
        return createExpressServer({
            defaults: {
                nullResultCode: 404,
                undefinedResultCode: 204,
                paramOptions: {
                    required: true
                }
            },
            authorizationChecker: auth0AuthChecker({
                issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
                audience: process.env.AUTH0_AUDIENCE
            }),
            currentUserChecker: currentUserChecker(
                Container.get(AuthManagementService)
            ),
            routePrefix: config.routePrefix,
            cors: {
                origin: '*',
                allowedHeaders: '*',
                exposedHeaders: '*',
                credentials: true
            },
            controllers: [
                PingController,
                GoogleCalendarController,
                MeetingInfoController
            ],
            middlewares: []
        });
    }

    public start() {
        this.app
            .listen(this.config.port, () => {
                console.log(
                    `⚡️[server]: Server is running at http://localhost:${this.config.port}`
                );
            })
            .on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    console.log('Error: address already in use');
                } else {
                    console.log(err);
                }
            });
    }
}
