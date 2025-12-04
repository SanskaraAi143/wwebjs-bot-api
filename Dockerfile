FROM node:18-slim

# Install wget and gnupg for adding Google Chrome repository
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    --no-install-recommends

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    ffmpeg \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application files
COPY bot.js ./
COPY send-media.js ./

# Create directory for session persistence
RUN mkdir -p .wwebjs_auth .wwebjs_cache

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "bot.js"]
