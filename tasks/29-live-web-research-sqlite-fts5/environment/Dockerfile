ARG OPENCLAW_BASE_IMAGE=ghcr.io/openclaw/openclaw:2026.3.11
FROM ${OPENCLAW_BASE_IMAGE}

ENV HOME=/home/node \
    CHROME_PATH=/usr/bin/chromium \
    BROWSER=/usr/bin/chromium \
    OPENCLAW_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3 \
    OPENCLAW_ARK_MODEL=kimi-k2.5
WORKDIR /home/node/.openclaw

USER root
RUN apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --fix-missing --no-install-recommends chromium ca-certificates fonts-liberation \
    && ln -sf /usr/bin/chromium /usr/bin/google-chrome \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /home/node/.openclaw/output /home/node/.openclaw/workspace/memory /home/node/.openclaw/workspace/state /home/node/.openclaw/workspace/db /home/node/.openclaw/tests /home/node/.openclaw/tools /home/node/.openclaw/solution \
    && chown -R node:node /home/node

USER node
