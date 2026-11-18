FROM postgres:16-bookworm

# We'd use the base image except we want the pg_ttl_index extension
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && install -d /etc/apt/keyrings \
    # Piggy-back on pigsty as signed APT pkg source
    && curl -fsSL https://repo.pigsty.io/key | gpg --dearmor -o /etc/apt/keyrings/pigsty.gpg \
    && echo 'deb [signed-by=/etc/apt/keyrings/pigsty.gpg] https://repo.pigsty.io/apt/pgsql/bookworm bookworm main' \
      > /etc/apt/sources.list.d/pigsty.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-16-ttl-index \
    && rm -rf /var/lib/apt/lists/*