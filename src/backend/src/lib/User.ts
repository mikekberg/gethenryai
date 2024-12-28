import { OAuth2Client } from 'google-auth-library';

export default interface User {
    userId: string;
    auth0UserInfo?: any; // TODO: Type
    googleAuthClient?: OAuth2Client;
}
