FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn global add serve
RUN yarn install

COPY public/ public/
COPY tailwind.config.ts tsconfig.json ./
COPY src/ src/
COPY index.html ./index.html
COPY vite.config.ts ./vite.config.ts
COPY postcss.config.js ./postcss.config.js

RUN ls -lhat

RUN yarn run build

EXPOSE 3000

CMD ["serve", "-s", "dist"]