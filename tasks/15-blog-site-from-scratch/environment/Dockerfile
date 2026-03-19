FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy test infrastructure
COPY tests/ /workspace/tests/
COPY environment/ /workspace/environment/

RUN mkdir -p /workspace/output
