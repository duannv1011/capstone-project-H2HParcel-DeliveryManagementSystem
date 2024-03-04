FROM node:20.10.0

WORKDIR /app

COPY ["package.json","./"]

RUN yarn install

COPY . .

RUN yarn build

CMD [ "yarn", "start", "dev" ]
