FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN mkdir -p uploads logs

EXPOSE 3000

CMD ["npm", "start"]