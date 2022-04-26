FROM node:18
ENV NODE_ENV=production
WORKDIR /
COPY ["package.json", "yarn-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "yarn", "run", "start" ]