FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g @expo/ngrok
COPY . .

EXPOSE 8081

CMD ["sh", "-c", "CI=1 npx expo start --tunnel"]
