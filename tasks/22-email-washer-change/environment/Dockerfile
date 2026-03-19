FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY environment/ /workspace/environment/
COPY tests/ /workspace/tests/

# Install shop-app dependencies
RUN cd /workspace/environment/shop-app/backend && pip install --no-cache-dir -r requirements.txt

# Install email-app dependencies
RUN cd /workspace/environment/email-app/backend && pip install --no-cache-dir -r requirements.txt
RUN cd /workspace/environment/email-app/frontend && npm install

COPY environment/startup.sh /workspace/environment/startup.sh
RUN chmod +x /workspace/environment/startup.sh

