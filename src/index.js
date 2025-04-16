import Fastify from "fastify";
import config from "./config/index.js";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/error-handler.js";

// Criar instância do Fastify
const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// Registrar manipulador de erros
errorHandler(fastify);

// Registrar rotas
fastify.register(routes);

// Iniciar servidor
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

start();
