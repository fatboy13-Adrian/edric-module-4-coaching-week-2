FROM node:16

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code (entire directory)
COPY . .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]