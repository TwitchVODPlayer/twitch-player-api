FROM node:18
WORKDIR /usr/src/app

COPY package.json yarn.lock .env build/ ./
RUN yarn install --prod

EXPOSE $PORT
CMD ["node", "-r", "dotenv/config", "server.js"]