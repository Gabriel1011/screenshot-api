import { convertHtmlToMarkdown } from '../services/html-to-markdown.service.js';

export default async function (fastify, options) {
  // Rota para renderizar a página de teste HTML to Markdown
  fastify.get('/markdown', async (request, reply) => {
    return reply.view('markdown', {
      adapterV1: 'Puppeteer',
      adapterV2: 'Playwright',
      protocol: request.protocol,
      hostname: request.hostname
    });
  });

  // Endpoint da API para converter HTML para Markdown
  fastify.post('/api/html-to-markdown', {
    schema: {
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri' },
          selector: { type: 'string' },
          waitForSelector: { type: 'string' },
          timeout: { type: 'integer', minimum: 1000, maximum: 120000 },
          fastMode: { type: 'boolean', default: false },
          version: { type: 'string', enum: ['v1', 'v2'], default: 'v1' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            markdown: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            canonicalUrl: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { url, selector, waitForSelector, timeout, version } = request.body;

      fastify.log.info(`Convertendo HTML para Markdown: ${url} (versao: ${version || 'v1'})`);

      const result = await convertHtmlToMarkdown(url, {
        selector,
        waitForSelector,
        timeout
      }, version);

      return result;
    } catch (error) {
      fastify.log.error(`Erro ao converter HTML para Markdown: ${error.message}`);
      throw error;
    }
  });
}