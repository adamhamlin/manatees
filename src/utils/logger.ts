import { FastifyBaseLogger } from 'fastify';

export let LOGGER: FastifyBaseLogger;

export function setLogger(logger: FastifyBaseLogger): void {
  LOGGER = logger;
}