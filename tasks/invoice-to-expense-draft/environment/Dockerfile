FROM liveclawbench-invoice-to-expense-draft-base:latest

# Copy environment apps (frontend SPAs are pre-built into the per-task base
# image; this layer just ensures workspace-side files are present for tasks
# that need them at runtime).
COPY . /workspace/environment/

RUN mkdir -p /workspace/output

CMD ["sh", "-c", "sleep infinity"]
