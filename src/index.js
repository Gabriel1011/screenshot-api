import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/error-handler.js";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
  trustProxy: true,
  bodyLimit: 30 * 1024 * 1024
});

errorHandler(fastify);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
  decorateReply: false
});

fastify.register(fastifyView, {
  engine: {
    handlebars: Handlebars
  },
  root: path.join(__dirname, "views"),
  defaultContext: {
    appName: "Screenshot API",
    version: process.env.npm_package_version || "1.0.0"
  },
  layout: "layouts/main.hbs", viewExt: "hbs"
});

fastify.register(routes);

fastify.addHook('onRequest', (request, reply, done) => {
  request.perfStart = process.hrtime.bigint();
  done();
});

fastify.addHook('onResponse', (request, reply, done) => {
  const end = process.hrtime.bigint();
  const start = request.perfStart || end;
  const durationMs = Number(end - start) / 1_000_000;

  fastify.log.info(`[PERFORMANCE] ${request.method} ${request.url} - Status: ${reply.statusCode} - Duration: ${durationMs.toFixed(2)}ms`);
  done();
});

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: "0.0.0.0"
    });
    fastify.log.info(`Servidor rodando na porta ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT recebido, encerrando servidor...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('SIGTERM recebido, encerrando servidor...');
  await fastify.close();
  process.exit(0);
});

start();
