# Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app
# We run npm ci first for caching node_modules
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend/ ./frontend/
# This creates /app/web through vite build outDir configuration
RUN cd frontend && npm run build

# Use a Dart container for compiling.
FROM dart:stable AS build

WORKDIR /app
COPY pubspec.* ./
RUN dart pub get

COPY . .
# We copy the built frontend from the previous stage
COPY --from=frontend-build /app/web ./web
RUN dart compile exe bin/main.dart -o bin/dgx_dashboard

# Switch to a minimal Alpine container for runtime.
FROM alpine:latest

# Install Docker CLI and glibc compatibility.
# gcompat is required for the glibc-linked Dart binary/nvidia-smi.
RUN apk add --no-cache docker-cli gcompat

WORKDIR /app

# Copy the compiled binary and web assets
COPY --from=build /app/bin/dgx_dashboard ./dgx_dashboard
COPY --from=build /app/web ./web

EXPOSE 8080
ENTRYPOINT ["./dgx_dashboard"]
