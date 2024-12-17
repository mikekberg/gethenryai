import "reflect-metadata";

import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import { ClassrouterFactory, JsonResponseFilter } from "classrouter";
import { HomeController } from "./controllers/home.controller";

export default class Server {
  constructor(app: Application) {
    this.config(app);
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "http://localhost:3000",
    };

    const factory = new ClassrouterFactory({
      basePath: "/api",
      logger: (l: string, m: string, o: any) => console.log(l, m, o),
      routerBuilder: () => express.Router(),
      controllers: [HomeController],
      responseFilters: {
        default: new JsonResponseFilter(),
        filters: [
          /*XML, Plan, File, */
        ], // your custom response filters
      },
    });

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    factory.build(app);
  }
}
