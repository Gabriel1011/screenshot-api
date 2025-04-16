FROM node:22-slim

# Instala dependências do sistema necessárias pro Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libasound2 \
  libnss3 \
  libxss1 \
  fonts-liberation \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Define diretório de trabalho
WORKDIR /app

COPY package*.json ./
COPY .env ./

RUN npm install
COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000
CMD ["npm", "start"]
