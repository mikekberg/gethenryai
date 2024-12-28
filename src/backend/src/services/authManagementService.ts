import { ManagementClient } from 'auth0';
import { google } from 'googleapis';
import { Service } from 'typedi';

@Service()
export default class AuthManagementService {
    private auth0MgmtClient: ManagementClient;

    constructor() {
        if (
            !process.env.AUTH0_DOMAIN ||
            !process.env.AUTH0_CLIENT_ID ||
            !process.env.AUTH0_CLIENT_SECRET
        ) {
            throw new Error(
                'Auth0 domain, client ID and secret must be provided in the environment'
            );
        }

        this.auth0MgmtClient = new ManagementClient({
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET
        });
    }

    public async getAuth0UserInfo(userId: string) {
        return (await this.auth0MgmtClient.users.get({ id: userId })).data;
    }

    public getGoogleAuthClient(access_token: string) {
        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({
            access_token: access_token
        });

        return authClient;
    }
}
