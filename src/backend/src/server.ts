import 'reflect-metadata';

import express, { Application } from 'express';
import { Action, createExpressServer, useContainer } from 'routing-controllers';
import { auth, AuthOptions } from 'express-oauth2-jwt-bearer';
import { GoogleCalendarController } from './controllers/googlecalendar.controller';
import { PingController } from './controllers/ping.controller';
import { MeetingInfoController } from './controllers/meetinginfo.controller';
import { Container } from 'typedi';
import AuthManagementService from './services/authManagementService';

// Enable Dependency Injection
useContainer(Container);

// Authorization Checker
function auth0AuthChecker(opts: AuthOptions) {
    const auth0 = auth(opts);

    return async (action: Action, roles: string[]) =>
        new Promise<boolean>((resolve, reject) => {
            auth0(action.request, action.response, (err: any) => {
                if (err) {
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        });
}

// Current User Checker
function currentUserChecker(authService: AuthManagementService) {
    return (action: Action) => {
        const userId = action.request.auth?.payload?.sub;

        if (!userId) {
            return null;
        } else {
            return authService.getAuth0UserInfo(userId);
        }
    };
}

export interface HeneryAPIServerConfig {
    port?: number;
    routePrefix?: string;
}

export default class HenryAPIServer {
    public app: Application;

    constructor(public config: HeneryAPIServerConfig = {}) {
        this.app = createExpressServer({
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

        this.config.port = config.port || Number(process.env.port) || 3000;
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
