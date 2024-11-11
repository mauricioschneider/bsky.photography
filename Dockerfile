# Build stage for frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM node:18 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --production

# Copy frontend build to serve statically
COPY --from=frontend-builder /app/frontend/build ./public

# Install serve for frontend
RUN npm install serve

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]