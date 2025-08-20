FROM node:18

RUN useradd -m next

WORKDIR /usr/src/app
# Accept build arg
ARG API_BASE_URL

# Inject config.js


COPY package*.json ./
RUN npm install

COPY . .
RUN echo "export const API_BASE_URL = '${API_BASE_URL}';" > src/config.js
RUN chown -R next:next /usr/src/app
USER next
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
