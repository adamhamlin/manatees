# Manatees

<p align="center">
	<img src="services/frontend/static/manatees-logo.svg" alt="Manatees logo" width="245">
</p>

Yet another Cards Against Humanity Clone—with custom deck builder!

## Current State

Just for playing adhoc games with friends hosted on your local computer.

## Environment Configuration

Create a local `.env` file. Replace placeholders with your own credentials and ngrok host; do not commit secrets.

```dotenv
PGPASSWORD=<redacted>
DATABASE_URL=<local-postgres-url>
NGROK_HOST=<your-ngrok-host>
MANATEES_PORT=5173
MANATEES_CREDENTIAL_NAME=MANATEES_USER_SESSION_TOKEN
MANATEES_AUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<redacted>
GOOGLE_REDIRECT_URI=https://${NGROK_HOST}/auth/google/callback
MANATEES_ALLOW_DEV_LOGINS=true
VITE_API_HOST=localhost:3456
VITE_MANATEES_CREDENTIAL_NAME=${MANATEES_CREDENTIAL_NAME}
VITE_MANATEES_ALLOW_DEV_LOGINS=${MANATEES_ALLOW_DEV_LOGINS}
```

This project uses Google OAuth as parimary ID provider. Set the Google OAuth redirect URI to match `GOOGLE_REDIRECT_URI`.

## Run the App

First time only:

```sh
just install clean
just db
```

Run each command below in its own terminal:

```sh
just server
```

```sh
just ui
```

```sh
just ngrok  # can skip if using "Fake Google" (MANATEES_ALLOW_DEV_LOGINS=true)
```
