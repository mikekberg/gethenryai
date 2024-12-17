"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = new index_1.default(app);
const port = process.env.PORT || 3000;
// Swagger setup
//setupSwagger(app);
app
    .listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
})
    .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log("Error: address already in use");
    }
    else {
        console.log(err);
    }
});
