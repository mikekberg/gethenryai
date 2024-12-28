import { ManagementClient } from 'auth0';
import { auth, AuthOptions } from 'express-oauth2-jwt-bearer';
import { google } from 'googleapis';
import { Action } from 'routing-controllers';
import User from 'src/lib/user';
import { Service } from 'typedi';

@Service()
export default class AuthManagementService {
    constructor(private managementClient: ManagementClient) {}

    public async getAuth0UserInfo(userId: string) {
        return (await this.managementClient.users.get({ id: userId })).data;
    }

    public getGoogleAuthClient(access_token: string) {
        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({
            access_token: access_token
        });

        return authClient;
    }
}

// Authorization Checker
export function auth0AuthChecker(opts: AuthOptions) {
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
export function currentUserChecker(authService: AuthManagementService) {
    return async (action: Action): Promise<User | null> => {
        const userId = action.request.auth?.payload?.sub;

        if (!userId) {
            return null;
        } else {
            const auth0Info = await authService.getAuth0UserInfo(userId);
            const googleToken = auth0Info.identities.find(
                (i) => i.provider === 'google-oauth2'
            )?.access_token;

            return {
                userId: auth0Info.user_id,
                auth0UserInfo: auth0Info,
                googleAuthClient: googleToken
                    ? authService.getGoogleAuthClient(googleToken)
                    : undefined
            };
        }
    };
}
