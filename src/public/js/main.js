document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('form[id^="screenshot-form-"]');
  const previewContainer = document.getElementById('preview-container');
  const previewImage = document.getElementById('preview-image');
  const loading = document.getElementById('loading');

  // Inicializar clipboard.js para os botões de cópia
  if (typeof ClipboardJS !== 'undefined') {
    new ClipboardJS('.copy-btn');

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const originalText = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    });
  }

  forms.forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const version = this.dataset.version;
      const url = document.getElementById(`url-${version}`).value;
      const fullPage = document.getElementById(`fullPage-${version}`).checked;
      const timeout = document.getElementById(`timeout-${version}`).value;

      // Mostrar loading
      loading.style.display = 'block';
      previewContainer.style.display = 'none';

      try {
        // Construir URL da API
        const params = new URLSearchParams();
        params.append('url', url);
        if (fullPage) params.append('fullPage', 'true');
        if (timeout) params.append('timeout', timeout);

        const apiUrl = `/${version}/screenshot?${params.toString()}`;

        // Fazer requisição
        const startTime = performance.now();
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Falha ao capturar screenshot: ${response.status} ${response.statusText}`);
        }

        // Converter resposta para blob
        const blob = await response.blob();
        const endTime = performance.now();

        // Criar URL do blob
        const imageUrl = URL.createObjectURL(blob);

        // Atualizar imagem
        previewImage.src = imageUrl;
        previewContainer.style.display = 'flex';

        // Mostrar tempo de resposta
        console.log(`Screenshot capturado com ${version} em ${(endTime - startTime).toFixed(0)}ms`);
      } catch (error) {
        alert('Erro: ' + error.message);
        console.error(error);
      } finally {
        // Esconder loading
        loading.style.display = 'none';
      }
    });
  });

  // Sincronizar campos entre abas
  const syncFields = (sourceId, targetId) => {
    const sourceElement = document.getElementById(sourceId);
    const targetElement = document.getElementById(targetId);

    if (sourceElement && targetElement) {
      sourceElement.addEventListener('input', () => {
        targetElement.value = sourceElement.value;
      });
    }
  };

  syncFields('url-v1', 'url-v2');
  syncFields('url-v2', 'url-v1');
  syncFields('timeout-v1', 'timeout-v2');
  syncFields('timeout-v2', 'timeout-v1');

  // Sincronizar checkboxes
  const syncCheckboxes = (sourceId, targetId) => {
    const sourceElement = document.getElementById(sourceId);
    const targetElement = document.getElementById(targetId);

    if (sourceElement && targetElement) {
      sourceElement.addEventListener('change', () => {
        targetElement.checked = sourceElement.checked;
      });
    }
  };

  syncCheckboxes('fullPage-v1', 'fullPage-v2');
  syncCheckboxes('fullPage-v2', 'fullPage-v1');

  // Inicializar tooltips do Bootstrap
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
});