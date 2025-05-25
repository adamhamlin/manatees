psql:
    PGPASSWORD=wearefriends PGOPTIONS=--search_path=app psql -h localhost -d manatees -U fallon

db:
  docker compose down -v
  docker compose up --wait
  npx prisma migrate dev
  npx prisma db seed

resetdb:
  npx prisma migrate reset --force

app:
  npm start

ngrok:
  ngrok http --url=$NGROK_HOST $MANATEES_PORT

run: db app