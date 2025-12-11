FROM oven/bun:1
WORKDIR /app

COPY package.json ./

RUN bun install --production

COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts tsconfig.json ./

ENV NODE_ENV=production
USER bun
EXPOSE 3000

CMD ["bun", "run", "start"]
