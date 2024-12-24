declare module "azure-aws-serverless-express" {
  import { Application } from "express";

  /**
   * Adapts an Express app to an Azure Function.
   *
   * @param app - The Express application to be handled by Azure Functions.
   * @returns An Azure Function that acts as a handler for the Express app.
   */
  export default function createHandler(app: Application): any;
}
