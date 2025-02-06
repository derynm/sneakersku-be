FROM oven/bun:debian

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install app dependencies
RUN bun install

# Generate Prisma client
RUN bun prisma generate

# Bind the app to port 3000
EXPOSE 3000

# Run the application
# CMD ["bun", "run", "start"]
CMD ["bun", "run", "src/index.ts"]
