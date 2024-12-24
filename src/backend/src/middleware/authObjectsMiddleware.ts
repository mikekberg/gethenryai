import { ManagementClient } from "auth0";
import { ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response } from "express";
import { google } from "googleapis";

export default class AuthObjectsMiddleware
  implements ExpressMiddlewareInterface
{
  // interface implementation is optional

  use(request: Request, response: Response, next: (err?: any) => any): any {
    var auth0MgmtClient = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || "henryai.ca.auth0.com",
      clientId:
        process.env.AUTH0_CLIENT_ID || "PFz1gfzKLEDUKZHU1k7l7YZiEpMgeTvW",
      clientSecret:
        process.env.AUTH0_CLIENT_SECRET ||
        "2ouJeyubjHIt05ZmiPyMYwyMm5fhnhWO0C80s5G2OBW1Vtk7U5XpO14earqwrXYQ",
    });
    const userId = request.auth?.payload.sub || "";

    console.log("auth is", request.auth);

    if (!userId) {
      return response
        .status(401)
        .send({ message: "User token data not found" });
    }

    auth0MgmtClient.users
      .get({ id: userId })
      .then((userDataResponse) => {
        console.log("here!");

        const auth0UserInfo = userDataResponse.data;
        request.auth0UserInfo = auth0UserInfo;

        const googleIdentity = auth0UserInfo.identities.find(
          (x: any) => x.provider === "google-oauth2"
        );

        if (!googleIdentity) {
          return;
        }

        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({
          access_token: googleIdentity.access_token,
        });

        request.googleAuthClient = authClient;
      })
      .catch((error) => {
        console.log("Error: ", error);
      })
      .finally(() => {
        next();
      });
  }
}
