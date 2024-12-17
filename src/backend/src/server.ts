// src/index.ts
import express, { Application, Express, Request, Response } from "express";
import dotenv from "dotenv";
import Server from "./index";

dotenv.config();

const app: Application = express();
const server: Server = new Server(app);
const port = process.env.PORT || 3000;

// Swagger setup
//setupSwagger(app);

app
  .listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("Error: address already in use");
    } else {
      console.log(err);
    }
  });
