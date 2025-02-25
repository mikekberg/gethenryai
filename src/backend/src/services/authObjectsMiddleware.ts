import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response } from 'express';
import AuthManagementService from 'src/services/authManagementService';
import { Service } from 'typedi';

// When used as middleware, this class will add the following properties to the request object:
// - auth0UserInfo: The user information from Auth0
// - googleAuthClient: The Google Auth client
@Service()
export default class AuthObjectsMiddleware
    implements ExpressMiddlewareInterface
{
    constructor(private managementClient: AuthManagementService) {}

    use(request: Request, response: Response, next: (err?: any) => any): any {
        const userId = request.auth?.payload.sub || '';

        if (!userId) {
            return response
                .status(401)
                .send({ message: 'User token data not found' });
        }

        this.managementClient
            .getAuth0UserInfo(userId)
            .then((auth0UserInfo) => {
                request.auth0UserInfo = auth0UserInfo;
                const googleIdentity = auth0UserInfo.identities.find(
                    (x: any) => x.provider === 'google-oauth2'
                );

                if (googleIdentity) {
                    request.googleAuthClient =
                        this.managementClient.getGoogleAuthClient(
                            googleIdentity.access_token
                        );
                }

                next();
            })
            .catch((error) => {
                next(error);
            });
    }
}
