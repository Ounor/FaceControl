FROM node:lts-alpine

WORKDIR /facecontrol

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["yarn", "run", "dev"]