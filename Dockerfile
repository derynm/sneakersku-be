FROM oven/bun:debian

WORKDIR /app

COPY package.json /app

RUN bun install

COPY . /app

RUN test -n "$DATABASE_URL" || (echo "Error: DATABASE_URL tidak ditemukan!" && exit 1)


RUN bunx prisma generate

RUN bun prisma migrate deploy

# Bind the app to port 3000
EXPOSE 3000

# Run the application
# CMD ["bun", "run", "start"]
CMD ["bun", "run", "src/index.ts"]
