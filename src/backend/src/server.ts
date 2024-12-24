import "reflect-metadata";

import express, { Application } from "express";
import { createExpressServer } from "routing-controllers";
import { auth } from "express-oauth2-jwt-bearer";
import path from "path";
import { GoogleCalendarController } from "./controllers/googlecalendar.controller";
import { PingController } from "./controllers/ping.controller";

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
          required: true,
        },
      },
      routePrefix: config.routePrefix,
      cors: {
        origin: "*",
        allowedHeaders: "*",
        exposedHeaders: "*",
        credentials: true,
      },
      controllers: [PingController, GoogleCalendarController],
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
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.log("Error: address already in use");
        } else {
          console.log(err);
        }
      });
  }
}
