FROM node:16.20.2 AS base
ENV APP_HOME=/usr/src/app \
  TERM=xterm
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 8000
EXPOSE 8002

FROM base AS development
ENV NODE_ENV development
COPY package.json package-lock.json ./

# ✅ Only increase timeout configs, don’t install latest npm
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set timeout 60000 && \
    npm install --legacy-peer-deps

COPY .babelrc index.js nodemon.json ./
COPY ./webpack ./webpack
COPY client ./client
COPY server ./server
COPY translations/locales ./translations/locales
COPY public ./public
CMD ["npm", "start"]
