import screenshotRoutes from "./screenshot.js";

/**
   * Registra todas as rotas da aplicação
   * @param {FastifyInstance} fastify - Instância do Fastify
   */
export default async function (fastify) {
  // Rota home com interface HTML interativa
  fastify.get("/", async (request, reply) => {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Screenshot API</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">
        <style>
          body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .hero {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 3rem 0;
            border-radius: 0 0 20px 20px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .card {
            border-radius: 15px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
            border: none;
            transition: transform 0.3s ease;
          }
          .card:hover {
            transform: translateY(-5px);
          }
          .card-header {
            background-color: #f1f5f9;
            border-radius: 15px 15px 0 0 !important;
            border-bottom: none;
            font-weight: 600;
          }
          .btn-primary {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
          }
          .btn-primary:hover {
            background: linear-gradient(135deg, #5b0fb3 0%, #1e68e0 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          .preview-container {
            background-color: #f1f5f9;
            border-radius: 10px;
            padding: 1rem;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .preview-image {
            max-width: 100%;
            max-height: 500px;
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .code-block {
            background-color: #2d3748;
            color: #e2e8f0;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            overflow-x: auto;
          }
          .footer {
            margin-top: 3rem;
            padding: 2rem 0;
            background-color: #f1f5f9;
            border-radius: 20px 20px 0 0;
          }
          .loading {
            display: none;
            text-align: center;
            padding: 2rem;
          }
          .spinner-border {
            width: 3rem;
            height: 3rem;
          }
        </style>
      </head>
      <body>
        <div class="hero text-center">
          <div class="container">
            <div class="logo">📸 Screenshot API</div>
            <p class="lead">Capture screenshots de qualquer site com uma simples requisição</p>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="card">
                <div class="card-header">
                  Teste a API
                </div>
                <div class="card-body">
                  <form id="screenshot-form">
                    <div class="mb-3">
                      <label for="url" class="form-label">URL do site</label>
                      <input type="url" class="form-control" id="url" placeholder="https://exemplo.com" required>
                    </div>
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" id="fullPage">
                      <label class="form-check-label" for="fullPage">Capturar página inteira</label>
                    </div>
                    <button type="submit" class="btn btn-primary">Capturar Screenshot</button>
                  </form>

                  <div id="loading" class="loading">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="mt-3">Capturando screenshot... Isso pode levar alguns segundos.</p>
                  </div>

                  <div id="preview-container" class="preview-container mt-4" style="display: none;">
                    <img id="preview-image" class="preview-image" src="" alt="Screenshot">
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  Como usar a API
                </div>
                <div class="card-body">
                  <h5>Endpoint</h5>
                  <div class="code-block">
                    GET /screenshot?url=https://exemplo.com&fullPage=true
                  </div>

                  <h5>Parâmetros</h5>
                  <ul>
                    <li><strong>url</strong> (obrigatório) - URL do site para capturar</li>
                    <li><strong>fullPage</strong> (opcional) - Define se deve capturar a página inteira (true) ou apenas a área visível (false)</li>
                  </ul>

                  <h5>Exemplo com cURL</h5>
                  <div class="code-block">
                    curl -X GET "${request.protocol}://${request.hostname}/screenshot?url=https://exemplo.com" --output screenshot.png
                  </div>

                  <h5>Exemplo com JavaScript</h5>
                  <div class="code-block">
                    fetch("${request.protocol}://${request.hostname}/screenshot?url=https://exemplo.com")
                      .then(response => response.blob())
                      .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "screenshot.png";
                        a.click();
                      });
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="footer text-center">
          <div class="container">
            <p>🛠️ Desenvolvido com Fastify + Puppeteer</p>
            <p>📦 Docker-ready</p>
            <p class="mb-0">📫 Autor: SeuNomeAqui</p>
          </div>
        </footer>

        <script>
          document.getElementById('screenshot-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const url = document.getElementById('url').value;
            const fullPage = document.getElementById('fullPage').checked;

            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            const loading = document.getElementById('loading');

            // Mostrar loading
            loading.style.display = 'block';
            previewContainer.style.display = 'none';

            try {
              // Construir URL da API
              const apiUrl = \`/screenshot?url=\${encodeURIComponent(url)}\${fullPage ? '&fullPage=true' : ''}\`;

              // Fazer requisição
              const response = await fetch(apiUrl);

              if (!response.ok) {
                throw new Error('Falha ao capturar screenshot');
              }

              // Converter resposta para blob
              const blob = await response.blob();

              // Criar URL do blob
              const imageUrl = URL.createObjectURL(blob);

              // Atualizar imagem
              previewImage.src = imageUrl;
              previewContainer.style.display = 'flex';
            } catch (error) {
              alert('Erro: ' + error.message);
              console.error(error);
            } finally {
              // Esconder loading
              loading.style.display = 'none';
            }
          });
        </script>
      </body>
      </html>
      `;

    return reply
      .code(200)
      .header("Content-Type", "text/html")
      .send(html);
  });

  // Registrar outras rotas
  await fastify.register(screenshotRoutes);
}
