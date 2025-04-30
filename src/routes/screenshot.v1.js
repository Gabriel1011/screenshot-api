import { captureScreenshot } from "../services/screenshot.service.js";

/**
 * Registra as rotas da API v1 (Puppeteer)
 * @param {FastifyInstance} fastify - Instância do Fastify
 */
export default async function (fastify) {
  fastify.get("/v1/screenshot", async (request, reply) => {
    const url = request.query.url;
    const fullPage = !!request.query.fullPage;
    const timeout = request.query.timeout ? parseInt(request.query.timeout, 10) : undefined;

    if (!url) {
      return reply.status(400).send({ error: "Missing 'url' parameter" });
    }

    try {
      const startTime = process.hrtime.bigint();

      const buffer = await captureScreenshot(url, { fullPage, timeout }, 'v1');

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      console.info(`[V1] Screenshot captured for ${url} in ${duration.toFixed(2)}ms`);

      return reply.header("Content-Type", "image/png").send(buffer);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to capture screenshot" });
    }
  });
}