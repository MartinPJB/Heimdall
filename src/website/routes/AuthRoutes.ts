// Dependencies
import { FastifyInstance } from "fastify";
import { AuthController } from "../controller/Auth.ts";
import RouteHandlerFromController from "./util/routeHandlerFromCtrlr.ts";


// Exporting routes
export default async function AuthRoutes(fastify: FastifyInstance) {
    return RouteHandlerFromController(AuthController, fastify);
}