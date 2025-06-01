# Greencity – Smart Street Lighting
Greencity is an end-to-end application for monitoring and controlling street lights.

## Architecture Overview

- **Frontend**: Angular 20, Angular Material, Mapbox GL for map visualization, Turf.js for geospatial calculations, ngeohash for geohash encoding, STOMP over WebSockets for real-time updates
- **Backend**: Java 21, Spring Boot 3.5, Spring Data JPA, PostgreSQL with PostGIS spatial extensions, Flyway for database migrations, Spring Security, Spring WebSocket, OpenFeign with Resilience4j for external AI integration, MapStruct for object mapping, Lombok for boilerplate reduction, Docker for containerization
- **AI Service**: Python 3.12, FastAPI, Uvicorn, OpenAI API, Poetry for dependency management, python-dotenv for environment configuration

## Project Structure

- `front/` – Angular application providing the user interface with real-time map updates and controls
- `backend/` – Spring Boot microservice exposing REST endpoints and WebSocket channels to manage street lights and integrate with AI chat
- `backend-ai/` – Python-based AI service offering a chat endpoint using OpenAI's models

## Getting Started

### Prerequisites
- Java 21 and Maven
- Docker & Docker Compose
- Node.js & NPM
- Python 3.12 and Poetry