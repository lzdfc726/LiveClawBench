FROM ghcr.io/openclaw/openclaw:2026.3.11

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy environment data and scripts
COPY . /workspace/environment/
COPY patches/ /workspace/patches/

# Create output directory
RUN mkdir -p /workspace/output

