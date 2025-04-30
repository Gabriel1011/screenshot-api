import { createBrowserPool } from './browser-pool.service.js';
import config from '../config/index.js';
import { createBrowserProvider } from '../providers/index.js';

const v1Pool = createBrowserPool(config.providers.v1);
const v2Pool = createBrowserPool(config.providers.v2);

/**
 * Captura screenshot de uma URL
 * @param {string} url - URL para capturar
 * @param {Object} options - Opções de captura
 * @param {string} version - Versão da API ('v1' ou 'v2')
 * @returns {Promise<Buffer>} Buffer da imagem
 */
export const captureScreenshot = async (url, options = {}, version = 'v1') => {
  const pool = version === 'v2' ? v2Pool : v1Pool;
  const provider = version === 'v2' ?
    createBrowserProvider(config.providers.v2) :
    createBrowserProvider(config.providers.v1);

  let wrappedPage = null;
  let screenshot = null;
  let error = null;

  try {
    wrappedPage = await pool.getPage();

    await wrappedPage.ensureValidPage();
    const { page } = wrappedPage;

    try {
      await provider.setupRequestInterception(page, (req) => {
        const resourceType = req.resourceType();
        if (['media', 'websocket', 'other'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
    } catch (interceptErr) {
      console.warn('Error setting up request interception:', interceptErr.message);
    }

    await provider.navigateTo(page, url, {
      waitUntil: "load",
      timeout: options.timeout || 60000
    });

    screenshot = await provider.takeScreenshot(page, {
      fullPage: options.fullPage || false
    });

    try {
      if (!await wrappedPage.isPageClosed()) {
        provider.removeListeners(page);
      }
    } catch (listenerErr) {
      console.warn('Error removing listeners:', listenerErr.message);
    }

    return screenshot;
  } catch (err) {
    error = err;
    console.error(`Error capturing screenshot for ${url}:`, error);
    throw error;
  } finally {
    if (wrappedPage && wrappedPage.release) {
      try {
        await wrappedPage.release();
      } catch (releaseErr) {
        console.error('Error releasing page:', releaseErr);
      }
    }
  }
};

/**
 * Limpa todos os recursos dos pools de browsers
 */
export const cleanup = async () => {
  try {
    await Promise.all([
      v1Pool.closeAll(),
      v2Pool.closeAll()
    ]);
    console.info('All browser resources cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
