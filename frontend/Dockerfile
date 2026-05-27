# Stage 1: Build Vite React application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the project (creates the 'dist' directory)
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy Nginx custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from the builder stage to Nginx web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
