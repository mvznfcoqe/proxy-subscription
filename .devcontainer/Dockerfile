FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    unzip \
    && rm -rf /var/lib/apt/lists/*

USER vscode

RUN curl -fsSL https://bun.sh/install | bash || \
    (curl -fSL https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip -o /tmp/bun.zip && \
     unzip /tmp/bun.zip -d /tmp && \
     mkdir -p ~/.bun/bin && \
     mv /tmp/bun-linux-x64/bun ~/.bun/bin/ && \
     rm -rf /tmp/bun.zip /tmp/bun-linux-x64)

WORKDIR /workspace

ENV PATH="/home/vscode/.bun/bin:${PATH}"
