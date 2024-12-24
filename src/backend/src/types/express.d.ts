import { OAuth } from "auth0";
import { OAuth2Client } from "google-auth-library";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      auth0UserInfo?: any;
      googleAuthClient: OAuth2Client;
    }
  }
}
