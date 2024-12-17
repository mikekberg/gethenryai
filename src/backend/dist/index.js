"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const classrouter_1 = require("classrouter");
const home_controller_1 = require("./controllers/home.controller");
class Server {
    constructor(app) {
        this.config(app);
    }
    config(app) {
        const corsOptions = {
            origin: "http://localhost:3000",
        };
        const factory = new classrouter_1.ClassrouterFactory({
            basePath: "/api",
            logger: (l, m, o) => console.log(l, m, o),
            routerBuilder: () => express_1.default.Router(),
            controllers: [home_controller_1.HomeController],
            responseFilters: {
                default: new classrouter_1.JsonResponseFilter(),
                filters: [
                /*XML, Plan, File, */
                ], // your custom response filters
            },
        });
        app.use((0, cors_1.default)(corsOptions));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        factory.build(app);
    }
}
exports.default = Server;
