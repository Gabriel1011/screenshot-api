# 📸 Screenshot API

Uma API simples e poderosa para capturar screenshots de qualquer site na web.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-Powered-40B5A4?logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-Server-000000?logo=fastify&logoColor=white)](https://www.fastify.io/)

## 🚀 Recursos

- **Captura de Screenshots**: Obtenha imagens PNG de qualquer site
- **Página Inteira ou Viewport**: Escolha entre capturar toda a página ou apenas a área visível
- **Anti-Detecção**: Implementação avançada para evitar bloqueios de sites que detectam bots
- **Interface Web**: Teste a API diretamente pelo navegador com nossa interface interativa
- **Docker Ready**: Fácil de implantar em qualquer ambiente com Docker
- **Arquitetura Modular**: Código organizado e fácil de manter

## 🛠️ Tecnologias

- **[Fastify](https://www.fastify.io/)**: Framework web rápido e eficiente
- **[Puppeteer](https://pptr.dev/)**: Biblioteca para controle do Chrome/Chromium
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

### Endpoint Principal

```
GET /screenshot?url=https://exemplo.com&fullPage=true
```

### Parâmetros

| Parâmetro | Tipo    | Descrição                                                |
|-----------|---------|----------------------------------------------------------|
| url       | string  | **Obrigatório**. URL do site para capturar               |
| fullPage  | boolean | **Opcional**. Capturar página inteira (padrão: false)    |

### Exemplos

#### Usando cURL

```bash
curl -X GET "http://localhost:3000/screenshot?url=https://exemplo.com" --output screenshot.png
```

#### Usando JavaScript

```javascript
fetch("http://localhost:3000/screenshot?url=https://exemplo.com")
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screenshot.png";
    a.click();
  });
```

#### Usando Python

```python
import requests

response = requests.get("http://localhost:3000/screenshot?url=https://exemplo.com")
with open("screenshot.png", "wb") as f:
    f.write(response.content)
```

## 🔌 Variáveis de Ambiente

| Variável                   | Descrição                                 | Padrão    |
|----------------------------|-------------------------------------------|-----------|
| PORT                       | Porta do servidor                         | 3000      |
| PUPPETEER_EXECUTABLE_PATH  | Caminho para o executável do Chrome       | (interno) |

## 📁 Estrutura do Projeto

```
/screenshot-api
  /src
    /config       # Configurações da aplicação
    /services     # Serviços (browser, screenshot)
    /utils        # Utilitários (anti-bot, user-agent)
    /routes       # Definição de rotas
    /middleware   # Middlewares (error-handler)
    index.js      # Ponto de entrada da aplicação
  package.json
  Dockerfile
  .env.example
  README.md
```

## 🧪 Testes

```bash
# Execute os testes
npm test
```

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

- **Gabriel Almeida** - [GitHub](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Puppeteer](https://pptr.dev/) - Por tornar a automação do navegador simples
- [Fastify](https://www.fastify.io/) - Por fornecer um framework web rápido e eficiente
- [Node.js](https://nodejs.org/) - Por tornar o JavaScript server-side possível

---

<p align="center">
  Feito com ❤️ e ☕
</p>
