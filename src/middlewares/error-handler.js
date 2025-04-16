/**
 * Middleware para tratamento de erros
 * @param {FastifyInstance} fastify - Instância do Fastify
 */
export default function (fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // Determinar código de status apropriado
    const statusCode = error.statusCode || 500;

    // Resposta de erro formatada
    const response = {
      error: error.message || "Erro interno do servidor",
      statusCode
    };

    // Em ambiente de desenvolvimento, incluir stack trace
    if (process.env.NODE_ENV !== 'production') {
      response.stack = error.stack;
    }

    reply.status(statusCode).send(response);
  });
}
