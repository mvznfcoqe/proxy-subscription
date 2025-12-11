FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

COPY src ./src

ENV NODE_ENV=production
USER bun

CMD ["bun", "run", "start"]
