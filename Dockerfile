FROM node:25.8.1-alpine3.22 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM ghcr.io/rtvkiz/minimal-node-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 8080

USER 1000:1000

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

CMD ["--enable-source-maps", "dist/index.cjs"]
