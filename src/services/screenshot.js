import { createBrowser, createPage } from "./browser.js";

/**
 * Captura screenshot de uma URL
 * @param {string} url - URL para capturar
 * @param {boolean} fullPage - Capturar página inteira
 * @returns {Promise<Buffer>} Buffer da imagem
 */
export const captureScreenshot = async (url, fullPage = false) => {
  let browser;
  try {
    browser = await createBrowser();
    const page = await createPage(browser);

    // Navegar para a URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Capturar screenshot
    return await page.screenshot({ fullPage });
  } finally {
    if (browser) await browser.close();
  }
};
