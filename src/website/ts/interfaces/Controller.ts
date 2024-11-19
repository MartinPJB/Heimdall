// Dependencies
import { FastifyRequest, FastifyReply, HTTPMethods } from 'fastify';

// Interfaces
interface Route {
  path: string;
  method: HTTPMethods;
  callback: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
}

export interface Controller {
  prefix: string;
  [key: string]: string | Route;
}