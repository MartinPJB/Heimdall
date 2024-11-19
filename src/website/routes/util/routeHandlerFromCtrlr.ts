// Dependencies
import { FastifyInstance, HTTPMethods } from "fastify";
import { Controller } from "../../ts/interfaces/Controller.ts";


// Function to build routes from controller object
export default function RouteHandlerFromController(controller: Controller, fastify: FastifyInstance) {
    const { prefix, ...routes } = controller;

    Object.entries(routes).forEach(([routeName, route]) => {
        if (typeof route === "object" && route.path) {
            const method = route.method as HTTPMethods;
            fastify[method.toLowerCase() as string](`/${prefix}/${route.path}`, route.callback);
        }
    });
}