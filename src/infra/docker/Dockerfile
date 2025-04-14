FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY dist/ ./dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "dist/index.js"]
