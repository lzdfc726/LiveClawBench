FROM ghcr.io/openclaw/openclaw:2026.3.11

HEALTHCHECK --interval=2s --timeout=1s --retries=1 CMD true

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . /workspace/environment/

RUN mkdir -p /workspace/output
