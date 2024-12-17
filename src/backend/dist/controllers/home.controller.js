"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const classrouter_1 = require("classrouter");
const auth0AuthorizationFilter_1 = __importDefault(require("../filters/auth0AuthorizationFilter"));
let HomeController = class HomeController {
    home(req, res) {
        return { message: "Welcome to application." };
    }
};
exports.HomeController = HomeController;
__decorate([
    (0, classrouter_1.Get)({ path: "/" })
], HomeController.prototype, "home", null);
exports.HomeController = HomeController = __decorate([
    (0, classrouter_1.Controller)({
        // name param required. use  the  param. Swagger json.
        name: "home",
        befores: [auth0AuthorizationFilter_1.default],
    })
], HomeController);
