import { launch } from "puppeteer";
import config from "../config/index.js";
import { getDesktopUserAgent } from "../utils/user-agent.js";
import { applyAntiDetectionTechniques } from "../utils/anti-bot.js";

/**
 * Cria e configura uma instância do navegador
 * @returns {Promise<Browser>} Instância do navegador
 */
export const createBrowser = async () => {
  const userAgent = getDesktopUserAgent();
  const launchOptions = {
    ...config.puppeteer.launchOptions,
    executablePath: config.puppeteer.executablePath,
    args: [
      ...config.puppeteer.launchOptions.args,
      `--user-agent=${userAgent}`
    ]
  };

  return await launch(launchOptions);
};

/**
 * Cria e configura uma página do navegador
 * @param {Browser} browser - Instância do navegador
 * @returns {Promise<Page>} Página configurada
 */
export const createPage = async (browser) => {
  const page = await browser.newPage();

  // Aplicar técnicas anti-detecção
  await applyAntiDetectionTechniques(page);

  // Configurar viewport
  await page.setViewport(config.puppeteer.defaultViewport);

  return page;
};
