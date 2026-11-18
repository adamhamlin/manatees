#!/bin/bash
#
# Init script to create application database for local dev container
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE "$APP_DB";
	ALTER DATABASE "$APP_DB" SET search_path TO "$APP_SCHEMA";
EOSQL
