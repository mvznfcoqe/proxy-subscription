FROM oven/bun:1
WORKDIR /app

COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/bot/package.json ./apps/bot/package.json

RUN bun install --production --cwd ./apps/bot

COPY apps/bot/src ./apps/bot/src

WORKDIR /app/apps/bot

ENV NODE_ENV=production
USER bun

CMD ["bun", "run", "start"]
