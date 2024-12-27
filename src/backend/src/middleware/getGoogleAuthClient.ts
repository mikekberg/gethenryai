import { Response, Request } from 'express';
import { google } from 'googleapis';

export default () =>
    async (req: Request, res: Response, next: any): Promise<any> => {
        if (!req.auth0UserInfo) {
            return res
                .status(401)
                .send({ message: 'User token data not found' });
        }

        const googleIdentity = req.auth0UserInfo.identities.find(
            (x: any) => x.provider === 'google-oauth2'
        );

        if (!googleIdentity) {
            return null;
        }

        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({
            access_token: googleIdentity.access_token
        });

        req.googleAuthClient = authClient;
    };
