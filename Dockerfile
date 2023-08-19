FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 3001
CMD node app.js