FROM node:20

RUN useradd -m next

WORKDIR /usr/src/app


ARG API_BASE_URL

COPY package*.json ./
RUN npm install


COPY . .


RUN echo "export const API_BASE_URL = '${API_BASE_URL}/api';" > src/config.js


RUN chown -R next:next /usr/src/app
USER next


EXPOSE 5173
CMD ["npm", "start"]
