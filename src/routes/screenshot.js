import { captureScreenshot } from "../services/screenshot.js";

/**
 * Registra as rotas relacionadas a screenshots
 * @param {FastifyInstance} fastify - Instância do Fastify
 */
export default async function (fastify) {
  fastify.get("/screenshot", async (request, reply) => {
    const url = request.query.url;
    const fullPage = !!request.query.fullPage;

    if (!url) {
      return reply.status(400).send({ error: "Missing 'url' parameter" });
    }

    try {
      const buffer = await captureScreenshot(url, fullPage);
      return reply.header("Content-Type", "image/png").send(buffer);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to capture screenshot" });
    }
  });
}
