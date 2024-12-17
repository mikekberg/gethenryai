import swaggerJsdoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const setupSwagger = (app: Application): void => {
  const swaggerOptions: Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Express API with Swagger",
        version: "1.0.0",
        description: "API documentation for the Express application",
      },
    },
    // Specify paths to TypeScript files containing Swagger JSDoc comments
    apis: ["./src/routes/*.ts"], // Adjust the path as needed
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Serve Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
