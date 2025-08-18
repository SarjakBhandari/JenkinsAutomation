FROM node:18
RUN useradd -m next
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN chown -R next:next /usr/src/app
USER next
EXPOSE 5000
CMD ["npm", "start"]