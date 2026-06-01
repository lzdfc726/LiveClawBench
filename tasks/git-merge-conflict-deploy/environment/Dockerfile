ARG OPENCLAW_BASE_IMAGE=liveclawbench-base:latest
FROM ${OPENCLAW_BASE_IMAGE}

USER root

RUN apt-get update -o Acquire::Retries=5 && \
    apt-get install -y --no-install-recommends -o Acquire::Retries=5 \
        nodejs npm git && \
    rm -rf /var/lib/apt/lists/*
# PR-4: pip with --retries 5 + --timeout 60 for transient PyPI flakes (Issue #101)
RUN pip install --break-system-packages --retries 5 --timeout 60 flask

COPY email-mock/ /workspace/environment/email-mock/
COPY scripts/ /workspace/environment/scripts/

RUN mkdir -p /workspace /logs/verifier

# Create the git repo with conflicts
RUN bash /workspace/environment/scripts/setup_repo.sh
# Clean up setup script — not part of the working environment
RUN rm -rf /workspace/environment/scripts/

COPY entrypoint.sh /entrypoint.sh
COPY startup.sh /startup.sh
RUN chmod +x /entrypoint.sh /startup.sh

HEALTHCHECK CMD true
CMD ["sleep", "infinity"]
ENTRYPOINT ["/entrypoint.sh"]
