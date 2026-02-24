# AGENTS.md - Development Guidelines for DGX Dashboard

Welcome, Agent! This file contains the instructions, commands, and conventions you need to effectively operate within the DGX Dashboard repository. Please read carefully before making any changes.

## 1. Project Overview & Architecture
DGX Dashboard is a Dart-based web application that provides a monitoring dashboard for DGX Spark systems. 
- **Backend:** Built with Dart SDK (3.9+). It serves the frontend static files and manages WebSocket connections to stream real-time system metrics.
- **Frontend:** Built with vanilla HTML, CSS, and JavaScript using Chart.js for data visualization. No frontend frameworks like React or Flutter are used.
- **Metrics Collected:** GPU usage (via `nvidia-smi`), CPU usage (via `/proc/uptime`), Memory (via `/proc/meminfo`), Temperatures (via `/sys/class/thermal`), and Docker container stats (via `docker` CLI).

## 2. Build, Run, and Deploy Commands

### 2.1 Dependency Management
```bash
# Get all Dart dependencies defined in pubspec.yaml
dart pub get

# Upgrade dependencies (use cautiously)
dart pub upgrade
```

### 2.2 Running the Application locally
```bash
# Run the application directly (requires nvidia-smi and Docker socket access)
dart bin/main.dart

# Run with verbose logging for debugging
dart bin/main.dart --verbose

# Compile to executable
dart compile exe bin/main.dart -o bin/dgx_dashboard
```

### 2.3 Docker Operations
```bash
# Build the production Docker image
docker build -t dgx_dashboard .

# Run with Docker Compose (standard local deployment)
docker-compose up -d

# Run manually with GPU capabilities
docker run -d --gpus all \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8080:8080 \
  dgx_dashboard
```

## 3. Testing, Linting, & Code Analysis

### 3.1 Testing Commands
Although the project currently lacks comprehensive automated tests, any newly introduced tests should utilize the standard `test` package.

```bash
# Run all tests in the project
dart test

# Run a specific test file
dart test test/monitor_test.dart

# Run a single specific test by its name or description
dart test test/monitor_test.dart -n "parses nvidia-smi correctly"

# Run tests with specific reporter/format (e.g. compact)
dart test -r compact

# Note: if there are no tests, run main to see if it boots (debugging)
dart bin/main.dart --verbose
```

*Note for Agents: When creating new features or fixing complex bugs, proactively add tests inside a `test/` directory, mimicking the structure of `lib/`.*

### 3.2 Linting & Formatting
```bash
# Analyze code for errors and lint warnings (strictly follow analysis_options.yaml)
dart analyze

# Format all Dart code in the project
dart format lib/ bin/ test/
```
*Note for Agents: Never commit code without ensuring `dart analyze` passes with 0 issues and `dart format` has been run.*

## 4. Code Style & Engineering Guidelines

### 4.1 Dart (Backend)
- **Imports:** 
  - Use *relative imports* for files within the same package (e.g., `import '../utils.dart';`).
  - Use *package imports* for external dependencies (e.g., `import 'package:shelf/shelf.dart';`).
  - Keep standard libraries at the top of the import block.
- **Variables & Typing:**
  - Always prefer `final` for variables that are not reassigned. Avoid `var` unless strictly necessary.
  - Use explicit types for all function parameters and return types.
  - The project is fully null-safe. Use nullable types (`T?`) only when a value can explicitly be absent.
- **Naming Conventions:**
  - **Classes & Enums:** `PascalCase` (e.g., `GpuMonitor`, `SystemMetrics`).
  - **Functions & Variables:** `lowerCamelCase` (e.g., `readMetrics`, `usagePercent`).
  - **Constants:** `camelCase` (e.g., `pollInterval`, `maxRetries`). Avoid `SCREAMING_SNAKE_CASE` in Dart.
  - **Files:** `snake_case.dart` (e.g., `gpu_monitor.dart`). One class per file in `lib/`.
- **Data Structures:**
  - Use Dart `Records` for lightweight typed tuples instead of creating small data classes (e.g., `(String name, int usage) getGpuStat()`).
- **Error Handling:**
  - Avoid swallow-all `catch (e)`. Always try to catch specific exceptions (e.g., `on FormatException catch (e)`).
  - Use the project's utility logging functions (`error()`, `warning()`, `fine()`) rather than raw `print()`.
  - Provide safe, non-destructive defaults where applicable (e.g., return `0` or `[]` instead of throwing fatal errors on UI-bound data).
- **Asynchronous Programming:**
  - Use `async`/`await` for Futures.
  - Prefer `Stream` and `async*` for continuous data sequences (like real-time GPU/CPU metrics).

### 4.2 Web & Frontend (JavaScript/HTML/CSS)
- **Framework:** Vanilla ES6+ JavaScript. No build step (Webpack/Vite) is used.
- **Naming:** Use `lowerCamelCase` for JavaScript variables and functions.
- **Styling:** 
  - Rely on CSS variables for consistent theming.
  - Primary UI colors: GPU (`#0057FF`), CPU/System (`#E77957`).
- **Performance:** When updating Chart.js instances with real-time WebSocket data, always use the `'none'` update mode to prevent high CPU usage from continuous animations.
- **Strings:** Use double quotes (`"`) in HTML/JS, but single quotes (`'`) in Dart.

## 5. Architectural & Implementation Rules

### 5.1 Metrics Collection
- **GPU:** Polled every 5 seconds via `nvidia-smi` using the `GpuMonitor` class (Stream-based).
- **CPU:** Calculated from `/proc/uptime`.
- **Memory:** Parsed from `/proc/meminfo`. Data in KiB is converted to KB.
- **Temperature:** Read from `/sys/class/thermal`.
- **Docker:** Polled every 10 seconds via `docker container ls` + `docker stats`.
- Do not change these underlying command executions unless the OS compatibility explicitly demands it.

### 5.2 WebSocket Protocol
- All real-time data is pushed to the client via a single WebSocket connection.
- Payload structure is rigidly defined as a JSON object: 
  `{ "gpu": [...], "cpu": {...}, "temperature": [...], "memory": {...}, "docker": [...], "nextPollSeconds": 5 }`
- Any new metric added must update both the Dart backend serializer and the JS frontend parser.

### 5.3 Security & Input Validation
- **Docker Actions:** When the frontend requests a Docker action (start/stop/restart), ensure the container name/ID is strictly validated using regex `^[a-zA-Z0-9_.-]{1,255}$` to prevent command injection.
- State management for pending commands is tracked client-side for UI feedback.
- Ensure WebSocket streams handle disconnects gracefully without leaking memory or leaving orphan processes.

## 6. Agent Rules & Workflow
When you are asked to make modifications, follow this procedure:
1. **Analyze Context:** Read existing files in `lib/` and `web/` to understand current patterns. Centralize constants in `lib/constants.dart`.
2. **Format & Analyze:** Before concluding your task, always verify your code by running `dart format` and `dart analyze`.
3. **No Unrequested Features:** Only implement what the user asked. Do not add libraries or packages unless absolutely required and vetted.
4. **Log Contextually:** If adding new monitoring streams, ensure proper failure logs are printed using the `error()` utility.

## 7. CI/CD Pipeline
- Docker images are built and pushed on Git tags (`v*`) via `.github/workflows/docker-publish.yml`.
- The registry used is `ghcr.io/dantup/dgx_dashboard`.
- Builds utilize a multi-stage Dockerfile (Dart SDK → Alpine).
