ARG OPENCLAW_BASE_IMAGE=ghcr.io/openclaw/openclaw:2026.3.11
FROM ${OPENCLAW_BASE_IMAGE}

ENV HOME=/home/node \
    OPENCLAW_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3 \
    OPENCLAW_ARK_MODEL=kimi-k2.5
WORKDIR /home/node/.openclaw

USER root
RUN mkdir -p /home/node/.openclaw/output /home/node/.openclaw/workspace/memory /home/node/.openclaw/tests /home/node/.openclaw/tools /home/node/.openclaw/solution \
    && chown -R node:node /home/node

USER node
