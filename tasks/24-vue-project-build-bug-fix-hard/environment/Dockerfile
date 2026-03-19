FROM ghcr.io/openclaw/openclaw:2026.3.11

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip unzip curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . /workspace/environment/

# Extract Vue CRM project
# TODO: inject harder bug set (currently same zip as easy variant — bug differentiation pending)
RUN cd /workspace/environment && unzip -q vue-crm-example.zip -d vue-crm || true

RUN mkdir -p /workspace/output
