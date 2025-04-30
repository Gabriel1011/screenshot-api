import { createPage } from "./browser.js";
import browserPool from "./browserPool.js";

/**
 * Captura screenshot de uma URL
 * @param {string} url - URL para capturar
 * @param {boolean} fullPage - Capturar página inteira
 * @returns {Promise<Buffer>} Buffer da imagem
 */
export const captureScreenshot = async (url, fullPage = false) => {
  let page;
  try {
    page = await browserPool.getPage();

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

    page.removeAllListeners('request');

    return screenshot;
  } catch (error) {
    console.error(`Error capturing screenshot for ${url}:`, error);
    throw error;
  } finally {
    if (page) {
      try {
        await browserPool.releasePage(page);
      } catch (error) {
        console.error('Error releasing page:', error);
      }
    }
  }
};

/**
 * Limpa todos os recursos do pool de browsers
 */
export const cleanup = async () => {
  try {
    await browserPool.closeAll();
    console.info('All browser resources cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
