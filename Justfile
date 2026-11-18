set dotenv-load

default:
  just --list

# Open a PSQL shell for the DB
psql:
    PGOPTIONS=--search_path=app psql -h localhost -d manatees -U fallon

# Start up the database
db:
  docker compose up --wait

# (Re)start + seed the database
db-nuclear:
  docker compose down -v
  docker compose up --wait
  just backend npx prisma migrate dev
  just backend npx prisma db seed

# Reset database to initial state
resetdb:
  just backend npx prisma migrate reset --force

# Start the backend server
server:
  MANATEES_SERVER_FLAGS="--watch" just backend npm start

# Run the frontend application
ui:
  just frontend npm run dev

# Run an npm install in every service, using the provided "mode"
[arg("mode", pattern='normal|clean|clean_no_cache')]
install mode='normal':
  if [ "{{mode}}" = "clean_no_cache" ]; then npm cache clean --force; fi
  if [ "{{mode}}" = "normal" ]; then npm i --package-lock; else npm ci; fi
  if [ "{{mode}}" = "normal" ]; then just frontend npm i --package-lock; else just frontend npm ci; fi
  if [ "{{mode}}" = "normal" ]; then just backend npm i --package-lock; else just backend npm ci; fi
  just backend npm run generate

# Fix fixable things
fix:
  npm run fix

# Run checks/validations
check:
  just shared npm run check
  just backend npm run check
  just frontend npm run check

# Run a command in frontend directory
[working-directory: './services/frontend']
frontend *cmd:
  {{cmd}}

# Run a command in backend directory
[working-directory: './services/backend']
backend *cmd:
  {{cmd}}

# Run a command in shared directory
[working-directory: './services/shared']
shared *cmd:
  {{cmd}}

ngrok:
  ngrok http --url=$NGROK_HOST $MANATEES_PORT
