import { v1Pool, v2Pool } from './browser-pool.service.js';
import config from '../config/index.js';
import { createBrowserProvider } from '../providers/index.js';
import TurndownService from 'turndown';

// Configuração do serviço Turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**'
});

// Personalizações adicionais do Turndown
turndownService.addRule('codeBlocks', {
  filter: ['pre'],
  replacement: function (content, node) {
    const language = node.querySelector('code')?.className.replace('language-', '') || '';
    return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
  }
});

/**
 * Captura HTML de uma URL e converte para Markdown
 * @param {string} url - URL para capturar
 * @param {Object} options - Opções de captura
 * @param {string} options.selector - Seletor CSS para extrair apenas parte da página
 * @param {string} options.waitForSelector - Seletor CSS para aguardar antes de capturar
 * @param {number} options.timeout - Tempo máximo de espera em ms
 * @param {boolean} options.fastMode - Modo rápido com menos espera
 * @param {string} version - Versão da API ('v1' ou 'v2')
 * @returns {Promise<Object>} Objeto com markdown e metadados
 */
export const convertHtmlToMarkdown = async (url, options = {}, version = 'v1') => {
  const pool = version === 'v2' ? v2Pool : v1Pool;
  const provider = version === 'v2' ?
    createBrowserProvider(config.providers.v2) :
    createBrowserProvider(config.providers.v1);

  let wrappedPage = null;
  let result = null;
  let error = null;

  const startTime = Date.now();

  try {
    wrappedPage = await pool.getPage();

    await wrappedPage.ensureValidPage();
    const { page } = wrappedPage;

    try {
      await provider.setupRequestInterception(page, (req) => {
        const resourceType = req.resourceType();
        // Bloquear mais tipos de recursos para melhorar a performance
        if (['image', 'media', 'font', 'websocket', 'other'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
    } catch (interceptErr) {
      console.warn('Error setting up request interception:', interceptErr.message);
    }

    // Usar waitUntil mais rápido baseado no modo
    const waitUntil = options.fastMode ? "domcontentloaded" : "load";

    await provider.navigateTo(page, url, {
      waitUntil: waitUntil,
      timeout: options.timeout || 60000
    });

    // Esperar pelo seletor específico se fornecido e não estiver em modo rápido
    if (options.waitForSelector && !options.fastMode) {
      try {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.waitForSelectorTimeout || 10000
        });
      } catch (selectorErr) {
        console.warn(`Selector "${options.waitForSelector}" not found, continuing anyway:`, selectorErr.message);
      }
    }

    // Extrair o HTML e outros metadados com pré-processamento para melhorar performance
    const data = await page.evaluate((selector) => {
      // Remover elementos que não são necessários para o markdown
      document.querySelectorAll('script, iframe, style, noscript, svg, canvas').forEach(el => el.remove());

      let html;
      if (selector) {
        const element = document.querySelector(selector);
        html = element ? element.outerHTML : document.documentElement.outerHTML;
      } else {
        html = document.documentElement.outerHTML;
      }

      return {
        html,
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.href || ''
      };
    }, options.selector);

    // Converter HTML para Markdown
    const markdown = turndownService.turndown(data.html);

    result = {
      url,
      markdown,
      title: data.title,
      description: data.metaDescription,
      canonicalUrl: data.canonicalUrl,
      processingTimeMs: Date.now() - startTime
    };

    try {
      if (!await wrappedPage.isPageClosed()) {
        provider.removeListeners(page);
      }
    } catch (listenerErr) {
      console.warn('Error removing listeners:', listenerErr.message);
    }

    return result;
  } catch (err) {
    error = err;
    console.error(`Error converting HTML to Markdown for ${url}:`, error);
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

