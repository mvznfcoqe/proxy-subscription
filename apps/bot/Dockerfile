FROM oven/bun:1
WORKDIR /app

COPY package.json ./

RUN bun install --production

COPY src ./src

ENV NODE_ENV=production
USER bun

CMD ["bun", "run", "start"]
