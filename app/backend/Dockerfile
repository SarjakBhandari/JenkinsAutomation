FROM node:18

# Create user
RUN useradd -m next
WORKDIR /usr/src/app

# Copy dependencies first
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Change ownership
RUN chown -R next:next /usr/src/app
USER next

# Expose port
EXPOSE 5050

# Important: make Node listen on 0.0.0.0
ENV HOST 0.0.0.0
ENV PORT 5050

# Start app
CMD ["npm", "start"]
