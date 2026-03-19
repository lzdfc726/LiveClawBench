FROM node:18-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy environment apps
COPY environment/ /workspace/environment/
COPY tests/ /workspace/tests/

# Install airline-app backend dependencies
RUN cd /workspace/environment/airline-app/backend && pip install --break-system-packages -r requirements.txt

# Install airline-app frontend dependencies
RUN cd /workspace/environment/airline-app/frontend && npm install

# Copy startup script
COPY environment/startup.sh /workspace/startup.sh
RUN chmod +x /workspace/startup.sh

RUN mkdir -p /workspace/output
