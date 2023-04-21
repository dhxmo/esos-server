FROM node:16.20.0

RUN mkdir /app
WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]
