"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to extract Auth0 token and validate it
exports.default = () => (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1]; // Bearer <token>
    try {
        const decodedToken = jsonwebtoken_1.default.decode(token, { complete: true });
        req.userData = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.payload;
    }
    catch (err) {
        return res.status(401).send({ message: "Invalid token" });
    }
    next();
};
