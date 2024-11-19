// Dependencies
import Fastify from "fastify";
import config from "../config.ts";


// Routes
import AuthRoutes from "./routes/AuthRoutes.ts";


// Variables
const server = Fastify({
    logger: true
});


// Start webserver function
async function startWebServer() {
    server.register(AuthRoutes, { prefix: "/api" });

    try {
        const port = config.WEBSITE_PORT
        await server.listen({ port });

        console.log(`🛡️ Heimdall> Website's API running on http://localhost:${port}/api`);
    } catch(e) {
        server.log.error(e);
    }
}

export default startWebServer;