/**
 * Interface base para providers de browser
 * Define os métodos que todos os providers devem implementar
 */
export class BrowserProvider {
  /**
   * Cria uma instância de browser
   * @param {Object} options - Opções de configuração
   * @returns {Promise<Browser>} Instância do browser
   */
  async createBrowser(options) {
    throw new Error('Method not implemented');
  }

  /**
   * Cria uma nova página no browser
   * @param {Browser} browser - Instância do browser
   * @returns {Promise<Page>} Nova página
   */
  async createPage(browser) {
    throw new Error('Method not implemented');
  }

  /**
   * Navega para uma URL
   * @param {Page} page - Página
   * @param {string} url - URL para navegar
   * @param {Object} options - Opções de navegação
   * @returns {Promise<Response>} Resposta da navegação
   */
  async navigateTo(page, url, options) {
    throw new Error('Method not implemented');
  }

  /**
   * Captura screenshot da página
   * @param {Page} page - Página
   * @param {Object} options - Opções de screenshot
   * @returns {Promise<Buffer>} Buffer da imagem
   */
  async takeScreenshot(page, options) {
    throw new Error('Method not implemented');
  }

  /**
   * Configura interceptação de requisições
   * @param {Page} page - Página
   * @param {Function} handler - Função para tratar requisições
   * @returns {Promise<void>}
   */
  async setupRequestInterception(page, handler) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove todos os listeners de eventos
   * @param {Page} page - Página
   * @param {string} event - Nome do evento (opcional)
   * @returns {void}
   */
  removeListeners(page, event) {
    throw new Error('Method not implemented');
  }

  /**
   * Fecha uma página
   * @param {Page} page - Página para fechar
   * @returns {Promise<void>}
   */
  async closePage(page) {
    throw new Error('Method not implemented');
  }

  /**
   * Fecha um browser
   * @param {Browser} browser - Browser para fechar
   * @returns {Promise<void>}
   */
  async closeBrowser(browser) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtém todas as páginas de um browser
   * @param {Browser} browser - Browser
   * @returns {Promise<Page[]>} Lista de páginas
   */
  async getBrowserPages(browser) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtém o browser associado a uma página
   * @param {Page} page - Página
   * @returns {Browser} Browser associado
   */
  getPageBrowser(page) {
    throw new Error('Method not implemented');
  }

  /**
   * Verifica se uma página está fechada
   * @param {Page} page - Página
   * @returns {boolean} True se a página estiver fechada
   */
  isPageClosed(page) {
    throw new Error('Method not implemented');
  }
}
