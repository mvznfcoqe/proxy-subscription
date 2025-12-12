FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --production --frozen-lockfile

ENV NODE_ENV=production
USER bun

WORKDIR /app/apps/bot

CMD ["bun", "run", "start"]
