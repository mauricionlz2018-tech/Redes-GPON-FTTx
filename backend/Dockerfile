# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json tsconfig.json ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY src/ ./src
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]

