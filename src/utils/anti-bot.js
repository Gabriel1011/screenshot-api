/**
 * Aplica técnicas anti-detecção de bots no navegador
 * @param {Page} page - Instância da página do Puppeteer
 */
export const applyAntiDetectionTechniques = async (page) => {
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
};
