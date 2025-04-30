# 📸 Screenshot API

Uma API simples e poderosa para capturar screenshots de qualquer site na web.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-Powered-40B5A4?logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-Enabled-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-Server-000000?logo=fastify&logoColor=white)](https://www.fastify.io/)

## 🚀 Recursos

- **Captura de Screenshots**: Obtenha imagens PNG de qualquer site
- **Página Inteira ou Viewport**: Escolha entre capturar toda a página ou apenas a área visível
- **Anti-Detecção**: Implementação avançada para evitar bloqueios de sites que detectam bots
- **Múltiplos Engines**: Suporte para Puppeteer (v1) e Playwright (v2)
- **Interface Web**: Teste a API diretamente pelo navegador com nossa interface interativa
- **Docker Ready**: Fácil de implantar em qualquer ambiente com Docker
- **Arquitetura Modular**: Código organizado e fácil de manter
- **Alta Performance**: Pool de navegadores para otimizar recursos e melhorar throughput

## 🛠️ Tecnologias

- **[Fastify](https://www.fastify.io/)**: Framework web rápido e eficiente
- **[Puppeteer](https://pptr.dev/)**: Biblioteca para controle do Chrome/Chromium
- **[Playwright](https://playwright.dev/)**: Framework moderno para automação de navegadores
- **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript
- **[Docker](https://www.docker.com/)**: Containerização para fácil implantação

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- npm ou yarn
- Chrome/Chromium (para execução local sem Docker)

## 🔧 Instalação

### Usando npm

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/screenshot-api.git
cd screenshot-api

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

### Usando Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/screenshot-api.git
cd screenshot-api

# Construa a imagem Docker
docker build -t screenshot-api .

# Execute o container
docker run -p 3000:3000 screenshot-api
```

## 📖 Como Usar

### Endpoints Disponíveis

A API oferece duas versões de endpoints para captura de screenshots, cada uma utilizando um engine diferente:

#### Puppeteer (v1)

```
GET /v1/screenshot?url=https://exemplo.com&fullPage=true
```

#### Playwright (v2)

```
GET /v2/screenshot?url=https://exemplo.com&fullPage=true
```

### Parâmetros

| Parâmetro | Tipo    | Descrição                                                |
|-----------|---------|----------------------------------------------------------|
| url       | string  | **Obrigatório**. URL do site para capturar               |
| fullPage  | boolean | **Opcional**. Capturar página inteira (padrão: false)    |
| timeout   | number  | **Opcional**. Timeout em ms (padrão: 60000)              |

### Exemplos

#### Usando cURL

```bash
# Usando Puppeteer (v1)
curl -X GET "http://localhost:3000/v1/screenshot?url=https://exemplo.com" --output screenshot-v1.png

# Usando Playwright (v2)
curl -X GET "http://localhost:3000/v2/screenshot?url=https://exemplo.com" --output screenshot-v2.png
```

#### Usando JavaScript

```javascript
// Usando Puppeteer (v1)
fetch("http://localhost:3000/v1/screenshot?url=https://exemplo.com")
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screenshot-v1.png";
    a.click();
  });

// Usando Playwright (v2)
fetch("http://localhost:3000/v2/screenshot?url=https://exemplo.com")
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screenshot-v2.png";
    a.click();
  });
```

#### Usando Python

```python
import requests

# Usando Puppeteer (v1)
response = requests.get("http://localhost:3000/v1/screenshot?url=https://exemplo.com")
with open("screenshot-v1.png", "wb") as f:
    f.write(response.content)

# Usando Playwright (v2)
response = requests.get("http://localhost:3000/v2/screenshot?url=https://exemplo.com")
with open("screenshot-v2.png", "wb") as f:
    f.write(response.content)
```

## 🔄 Diferenças entre v1 (Puppeteer) e v2 (Playwright)

| Característica | v1 (Puppeteer) | v2 (Playwright) |
|----------------|----------------|-----------------|
| Engine         | Chrome/Chromium | Múltiplos navegadores (Chrome, Firefox, WebKit) |
| Performance    | Boa            | Excelente       |
| Compatibilidade| Alta           | Muito alta      |
| Anti-detecção  | Básico         | Avançado        |
| Recursos       | Completo       | Mais completo   |

Escolha a versão que melhor atende às suas necessidades. Para a maioria dos sites, ambas as versões funcionarão bem, mas para sites com detecção de bots mais avançada, a v2 (Playwright) pode oferecer melhor sucesso.

## 🔌 Variáveis de Ambiente

| Variável                   | Descrição                                 | Padrão    |
|----------------------------|-------------------------------------------|-----------|
| PORT                       | Porta do servidor                         | 3000      |
| PUPPETEER_EXECUTABLE_PATH  | Caminho para o executável do Chrome       | (interno) |
| PLAYWRIGHT_BROWSERS_PATH   | Caminho para os navegadores do Playwright | (interno) |

## 📁 Estrutura do Projeto

```
/screenshot-api
  /src
    /config       # Configurações da aplicação
    /services     # Serviços (browser, screenshot)
    /providers    # Providers para diferentes engines (puppeteer, playwright)
    /utils        # Utilitários (anti-bot, user-agent)
    /routes       # Definição de rotas (v1, v2)
    /middleware   # Middlewares (error-handler)
    index.js      # Ponto de entrada da aplicação
  package.json
  Dockerfile
  load-test.yml   # Configuração para testes de carga
  .env.example
  README.md
```

## 🧪 Testes

```bash
# Execute os testes unitários
npm test

# Execute testes de carga
npm run load-test
```

## 📊 Performance

A API foi projetada para alta performance com:

- Pool de navegadores para reutilização
- Gerenciamento inteligente de recursos
- Recuperação automática de falhas
- Otimização de memória e CPU

Em testes de carga, a API consegue lidar com mais de 10 requisições por segundo em hardware modesto.

## 🔒 Considerações de Segurança

- Esta API permite acessar qualquer URL. Em ambientes de produção, considere implementar:
  - Lista de permissões para domínios
  - Autenticação por API key
  - Rate limiting para evitar abusos

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

- **Gabriel Almeida** - [GitHub](https://github.com/Gabriel1011)

## 🙏 Agradecimentos

- [Puppeteer](https://pptr.dev/) - Por tornar a automação do navegador simples
- [Playwright](https://playwright.dev/) - Por fornecer uma solução moderna para automação
- [Fastify](https://www.fastify.io/) - Por fornecer um framework web rápido e eficiente
- [Node.js](https://nodejs.org/) - Por tornar o JavaScript server-side possível

---

<p align="center">
  Feito com ❤️ e ☕
</p>
