// Dependencies
import { FastifyReply, FastifyRequest } from "fastify";
import axios from "axios";
import config from "../../config.ts";
import { Controller } from "../ts/interfaces/Controller.ts";


// Variables
const DISCORD_ENDPOINTS = {
    OAUTH_URL: `https://discord.com/oauth2/authorize?client_id=${config.DISCORD_CLIENTID}&redirect_uri=${encodeURIComponent(config.DISCORD_REDIRECTURI)}&response_type=code&scope=identify`,
    TOKEN_URL: "https://discord.com/api/oauth2/token",
    USER_URL: "https://discord.com/api/users/@me",
};


// Controller
export const AuthController: Controller = {
    prefix: "auth", // -> localhost/{prefix}/{route.path}

    login: {
        path: "login",
        method: "GET",

        /**
         * Simply redirects to the discord's auth url
         * @param req - Fastify Request object
         * @param rep - Rastify Reply object
         */
        callback: async (req: FastifyRequest, rep: FastifyReply) => {
            rep.redirect(DISCORD_ENDPOINTS.OAUTH_URL);
        }
    },


    callback: {
        path: "callback",
        method: "GET",

        /**
         * Handles Discord OAuth callback
         * @param req - Fastify Request object
         * @param rep - Rastify Reply object
         */
        callback: async (req: FastifyRequest, rep: FastifyReply) => {
            const code = (req.query as any).code;
            if (!code) {
                return rep.status(400)
                .send({
                    code: 400,
                    message: "No discord callback code found."
                });
            }

            // Echange code for access token
            try {

                const tokenResponse = await axios.post(
                    DISCORD_ENDPOINTS.TOKEN_URL,
                    new URLSearchParams({
                        'client_id': config.DISCORD_CLIENTID,
                        'client_secret': config.DISCORD_CLIENTSECRET,
                        'grant_type': 'authorization_code',
                        'redirect_uri': config.DISCORD_REDIRECTURI,
                        'code': code
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                const { access_token } = tokenResponse.data;

                // Fetch user data
                const userResponse = await axios.get(DISCORD_ENDPOINTS.USER_URL, {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    },
                });

                const userData = userResponse.data;

                return rep.status(200)
                .send({
                    code: 200,
                    message: "Discord's user data fetched properly.",
                    data: userData
                });

            } catch(e) {
                console.error(e);
                return rep.status(500)
                .send({
                    code: 500,
                    message: "Discord Authentication failed.",
                    error: e
                });
            }
        }
    },
}