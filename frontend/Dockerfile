# Taken from (with good explanation) : https://gist.github.com/aradalvand/04b2cad14b00e5ffe8ec96a3afbb34fb
FROM node:20.11.0-alpine3.18 AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20.11.0-alpine3.18
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]
