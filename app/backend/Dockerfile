
FROM node:20


RUN useradd -m next


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --production

COPY . .


RUN chown -R next:next /usr/src/app
USER next

EXPOSE 5050

ENV HOST=0.0.0.0
ENV PORT=5050

# Start the app
CMD ["npm", "start"]
