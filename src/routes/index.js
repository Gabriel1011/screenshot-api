import v1Routes from './screenshot.v1.js';
import v2Routes from './screenshot.v2.js';
import config from '../config/index.js';
import markdownRoutes from './markdown.routes.js';

/**
 * Registra todas as rotas da aplicação
 * @param {FastifyInstance} fastify - Instância do Fastify
 */
export default async function (fastify) {
  fastify.get("/", async (request, reply) => {
    try {
      const adapterV1 = config?.adapters?.v1 || 'puppeteer';
      const adapterV2 = config?.adapters?.v2 || 'playwright';

      return reply.view('index', {
        title: 'Home',
        adapterV1,
        adapterV2,
        protocol: request.protocol,
        hostname: request.hostname
      });
    } catch (error) {
      fastify.log.error(`Erro ao renderizar página inicial: ${error.message}`);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  await fastify.register(v1Routes);
  await fastify.register(v2Routes);

  fastify.get("/screenshot", async (request, reply) => {
    return reply.redirect(302, `/v1/screenshot?${new URLSearchParams(request.query).toString()}`);
  });

  fastify.register(markdownRoutes);
}
