import { createPage } from "./browser.js";
import browserPool from "./browserPool.js";

/**
 * Captura screenshot de uma URL
 * @param {string} url - URL para capturar
 * @param {boolean} fullPage - Capturar página inteira
 * @returns {Promise<Buffer>} Buffer da imagem
 */
export const captureScreenshot = async (url, fullPage = false) => {
  let browser;
  try {
    browser = await browserPool.getBrowser();
    const page = await createPage(browser);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['font', 'media', 'websocket', 'other'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "load", timeout: 60000 });

    const screenshot = await page.screenshot({ fullPage });

    await page.close();

    return screenshot;
  } finally {
    if (browser) {
      browserPool.releaseBrowser(browser);
    }
  }
};

export const cleanup = async () => {
  await browserPool.closeAll();
};
