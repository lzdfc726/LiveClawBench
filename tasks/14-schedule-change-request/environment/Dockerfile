FROM ghcr.io/openclaw/openclaw:2026.3.11

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy environment apps
COPY . /workspace/environment/

# Install email-app backend dependencies
RUN cd /workspace/environment/email-app/backend && pip install --break-system-packages -r requirements.txt

# Install email-app frontend dependencies
RUN cd /workspace/environment/email-app/frontend && npm install

# Install todolist-app backend dependencies
RUN cd /workspace/environment/todolist-app/backend && pip install --break-system-packages -r requirements.txt

# Install todolist-app frontend dependencies
RUN cd /workspace/environment/todolist-app/frontend && npm install

# Inject initial data
RUN cd /workspace/environment/email-app/backend && python3 scripts/inject_data.py
RUN cd /workspace/environment/todolist-app/backend && python3 init_db.py && python3 inject_data.py && python3 inject_data_manual.py

# Copy startup script
COPY startup.sh /workspace/startup.sh
RUN chmod +x /workspace/startup.sh

RUN mkdir -p /workspace/output

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "sleep infinity"]
