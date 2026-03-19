FROM ghcr.io/openclaw/openclaw:2026.3.11

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY . /workspace/environment/

# Install shop-app dependencies
RUN cd /workspace/environment/shop-app/backend && pip install --no-cache-dir -r requirements.txt

# Install email-app dependencies
RUN cd /workspace/environment/email-app/backend && pip install --no-cache-dir -r requirements.txt
RUN cd /workspace/environment/email-app/frontend && npm install

COPY startup.sh /workspace/environment/startup.sh
RUN chmod +x /workspace/environment/startup.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "sleep infinity"]

