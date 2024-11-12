# Frontend build stage
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM node:18 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --omit=dev

# Copy frontend build to public directory for static serving
COPY --from=frontend-builder /app/frontend/dist ./public/

EXPOSE 8080
CMD ["node", "dist/server.js"]