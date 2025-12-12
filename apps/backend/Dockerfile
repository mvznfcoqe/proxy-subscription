FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --production --frozen-lockfile

ENV NODE_ENV=production
USER bun
EXPOSE 3000

WORKDIR /app/apps/backend

CMD ["bun", "run", "--cwd", "apps/backend", "start"]
