FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 unzip curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY environment/ /workspace/environment/
COPY tests/ /workspace/tests/

# Extract Vue CRM project
RUN cd /workspace/environment && unzip -q vue-crm-example.zip -d vue-crm || true

RUN mkdir -p /workspace/output
