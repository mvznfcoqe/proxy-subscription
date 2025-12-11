FROM oven/bun:1
WORKDIR /app

COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/backend/package.json ./apps/backend/package.json

RUN bun install --production --cwd ./apps/backend

COPY apps/backend/src ./apps/backend/src
COPY apps/backend/drizzle ./apps/backend/drizzle
COPY apps/backend/drizzle.config.ts apps/backend/tsconfig.json ./apps/backend/

WORKDIR /app/apps/backend

ENV NODE_ENV=production
USER bun
EXPOSE 3000

CMD ["bun", "run", "start"]
