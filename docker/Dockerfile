# AmpMatter Marine Monitor - Dockerfile
# Multi-stage build for Raspberry Pi 4

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client
COPY tsconfig.base.json ./

# Build the application
RUN pnpm --filter @ampmatter/client build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
