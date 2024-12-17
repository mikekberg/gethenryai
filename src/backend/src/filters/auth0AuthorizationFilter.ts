import jwt from "jsonwebtoken";
import { IMiddleware } from "classrouter";
import { Response, Request } from "express";

// Middleware to extract Auth0 token and validate it
export default () =>
  (req: Request, res: Response, next: any): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    try {
      const decodedToken = jwt.decode(token, { complete: true });
      req.userData = decodedToken?.payload as any;
    } catch (err) {
      return res.status(401).send({ message: "Invalid token" });
    }

    next();
  };
