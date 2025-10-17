FROM node:16

WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN npm ci \
 && npm run build:css

EXPOSE 3000

CMD [ "npm", "run", "start" ]
