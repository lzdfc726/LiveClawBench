FROM liveclawbench-newsletter-digest-forward-base:latest

# Copy environment apps (frontend SPA is pre-built into the per-task base image).
COPY . /workspace/environment/

# Empty notes/ directory — the agent must author newsletter-digest.md there.
RUN mkdir -p /workspace/notes

RUN mkdir -p /workspace/output

CMD ["sh", "-c", "sleep infinity"]
