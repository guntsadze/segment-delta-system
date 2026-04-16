FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Next.js-ის ბილდი
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]