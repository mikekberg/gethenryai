import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { ManagementClient } from 'auth0';

// Middleware to extract Auth0 token and validate it
export default () =>
    (req: Request, res: Response, next: any): any => {
        var auth0MgmtClient = new ManagementClient({
            domain: process.env.AUTH0_DOMAIN || '',
            clientId: process.env.AUTH0_CLIENT_ID || '',
            clientSecret: process.env.AUTH0_CLIENT_SECRET || ''
        });
        const userId = req.auth?.payload.sub || '';

        if (!userId) {
            return res
                .status(401)
                .send({ message: 'User token data not found' });
        }

        auth0MgmtClient.users
            .get({ id: userId })
            .then((userDataResponse) => {
                req.auth0UserInfo = userDataResponse.data;
            })
            .finally(() => {
                next();
            });
    };
