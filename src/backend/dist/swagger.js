"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const setupSwagger = (app) => {
    const swaggerOptions = {
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
    const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
    // Serve Swagger UI
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.default = setupSwagger;
