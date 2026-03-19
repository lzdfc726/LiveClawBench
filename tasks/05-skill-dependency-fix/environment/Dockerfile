FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy environment data and scripts
COPY environment/ /workspace/environment/
COPY patches/ /workspace/patches/
COPY tests/ /workspace/tests/

# Create output directory
RUN mkdir -p /workspace/output

