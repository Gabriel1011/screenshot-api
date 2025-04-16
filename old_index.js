import dotenv from "dotenv";
import Fastify from "fastify";
import { launch } from "puppeteer";
import UserAgent from "user-agents";

dotenv.config();

const fastify = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;
const EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

// Substituir a lista manual por geração dinâmica
const userAgent = new UserAgent({ deviceCategory: 'desktop' });

fastify.get("/screenshot", async (request, reply) => {
  const url = request.query.url;
  const fullPage = !!request.query.fullPage;

  if (!url) {
    return reply.status(400).send({ error: "Missing 'url' parameter" });
  }

  let browser;
  try {
    // Configurações avançadas para evitar detecção
    browser = await launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--disable-blink-features=AutomationControlled", // Crucial para evitar detecção
        `--user-agent=${userAgent.toString()}`,
        "--disable-extensions",
        "--disable-default-apps",
        "--disable-features=site-per-process",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
      ],
      executablePath: EXECUTABLE_PATH,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Modificar o WebDriver para evitar detecção
    await page.evaluateOnNewDocument(() => {
      // Remover WebDriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Remover Chrome
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {
              type: "application/x-google-chrome-pdf",
              suffixes: "pdf",
              description: "Portable Document Format",
              enabledPlugin: Plugin,
            },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin",
          },
        ],
      });

      // Modificar a detecção de linguagens
      Object.defineProperty(navigator, 'languages', {
        get: () => ['pt-BR', 'pt', 'en-US', 'en'],
      });

      // Adicionar um canvas fingerprint aleatório
      const getParameter = WebGLRenderingContext.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) {
          return 'Intel Open Source Technology Center';
        }
        if (parameter === 37446) {
          return 'Mesa DRI Intel(R) HD Graphics 5500 (Broadwell GT2)';
        }
        return getParameter.apply(this, arguments);
      };
    });

    // Configurar viewport com dimensões realistas
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });

    // Simular comportamento humano
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const buffer = await page.screenshot({ fullPage });

    reply.header("Content-Type", "image/png").send(buffer);
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to capture screenshot" });
  } finally {
    if (browser) await browser.close();
  }
});

// Resto do código permanece o mesmo...

fastify.get("/", async (request, reply) => {
  const asciiArt = `
        ██████╗ █████╗ ███╗   ███╗███████╗██████╗  █████╗ ██████╗
        ██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗
        ██║  ██║███████║██╔████╔██║█████╗  ██████╔╝███████║██████╔╝
        ██║  ██║██╔══██║██║╚██╔╝██║██╔══╝  ██╔═══╝ ██╔══██║██╔═══╝
        ██████╔╝██║  ██║██║ ╚═╝ ██║███████╗██║     ██║  ██║██║
        ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝

        🚀 Screenshot API
        --------------------------
        GET /screenshot?url=https://exemplo.com
        Retorna uma imagem PNG da página.

        🛠️ Desenvolvido com Fastify + Puppeteer
        📦 Docker-ready
        📫 Autor: SeuNomeAqui
  `;

  return reply
    .code(200)
    .header("Content-Type", "text/plain")
    .send(asciiArt);
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
