import { createBrowserPool } from './browser-pool.service.js';
import config from '../config/index.js';
import { createBrowserProvider } from '../providers/index.js';

// Criar pools para cada versão
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

  let page, release;
  try {
    ({ page, release } = await pool.getPage());

    // Configurar interceptação de requisições
    await provider.setupRequestInterception(page, (req) => {
      const resourceType = req.resourceType();
      if (['media', 'websocket', 'other'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navegar para a URL
    await provider.navigateTo(page, url, {
      waitUntil: "load",
      timeout: options.timeout || 60000
    });

    // Capturar screenshot
    const screenshot = await provider.takeScreenshot(page, {
      fullPage: options.fullPage || false
    });

    // Remover listeners
    provider.removeListeners(page);

    return screenshot;
  } catch (error) {
    console.error(`Error capturing screenshot for ${url}:`, error);
    throw error;
  } finally {
    if (page) {
      try {
        await release(page);
      } catch (error) {
        console.error('Error releasing page:', error);
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
