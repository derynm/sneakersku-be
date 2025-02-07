FROM oven/bun:debian

WORKDIR /app

COPY package.json /app

RUN bun install

COPY . /app

# Tambahkan ARG dan ENV agar variabel bisa diakses saat build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN test -n "$DATABASE_URL" || (echo "Error: DATABASE_URL tidak ditemukan!" && exit 1)

RUN bunx prisma generate

RUN bun prisma migrate deploy

# Bind the app to port 3000
EXPOSE 3000

# Run the application
# CMD ["bun", "run", "start"]
CMD ["bun", "run", "src/index.ts"]
