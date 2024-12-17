import { Controller, Get, IMiddleware, JsonResponseFilter } from "classrouter";
import { Request, Response } from "express";
import validateAuth0Token from "../filters/auth0AuthorizationFilter";

@Controller({
  // name param required. use  the  param. Swagger json.
  name: "home",
  befores: [validateAuth0Token],
})
export class HomeController {
  @Get({ path: "/" })
  public home(req: Request, res: Response) {
    return { message: "Welcome to application." };
  }
}
