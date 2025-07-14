# Frappe Books development container with OCR
FROM node:20.18.1-bullseye

# Install system dependencies for Electron and native modules
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    libgtk-3-0 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libasound2 \
    libatk1.0-0 libatk-bridge2.0-0 libxkbcommon0 libxss1 libnss3 libdrm2 libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# Install PaddleOCR (pinned for compatibility)
RUN pip3 install paddleocr==2.7.0

ENV ELECTRON_EXTRA_LAUNCH_ARGS=--no-sandbox
EXPOSE 6969

CMD ["yarn", "dev"]
