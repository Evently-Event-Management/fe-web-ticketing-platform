# ---- Base build image ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies (only package.json + lock file first for caching)
COPY package*.json ./
RUN npm ci

# Copy project files and build Next.js app
COPY . .
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose port
EXPOSE 8090

# Start Next.js app
CMD ["npm", "start"]
