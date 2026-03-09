# PROJECT KNOWLEDGE BASE - BACKEND (Onyx)

This file provides guidance to AI agents operating in the `backend/` directory of the Onyx (formerly Danswer) codebase.

## 1. Build, Lint, and Test Commands

*   **Environment Setup**: Always run Python commands with `source .venv/bin/activate` or `uv run ...` to assume the virtual environment.
*   **Linting & Formatting**:
    *   Run `pre-commit run --all-files` for full formatting.
    *   Run `ruff check .` for quick linting.
    *   Run `mypy .` for strict type checking.
*   **Testing Setup**:
    *   Tests require environment variables, usually loaded via `.vscode/.env`.
    *   Run commands as: `python -m dotenv -f ../.vscode/.env run -- pytest <args>`
*   **Running Tests**:
    *   **Unit Tests**: `pytest -xv tests/unit/<path_to_test.py>`
    *   **External Unit Tests**: `python -m dotenv -f ../.vscode/.env run -- pytest tests/external_dependency_unit/<path>`
    *   **Integration Tests**: `python -m dotenv -f ../.vscode/.env run -- pytest tests/integration/<path>`
    *   **Single Test Method**: `pytest <path_to_file.py>::<TestClass>::<test_method>` (or function name).
*   **Database Migrations (Alembic)**:
    *   Standard DB: `alembic upgrade head`
    *   Tenant/Enterprise DB: `alembic -n schema_private upgrade head`
    *   Create Migration: `alembic revision -m "description"` (or use `-n schema_private` for Enterprise).

## 2. Code Style Guidelines

*   **Imports**: Avoid `from module import *`. Use absolute imports from the `onyx` root (e.g., `from onyx.db.models import User`). Let `ruff` handle import sorting.
*   **Types**: Enforce strict typing. Use `Pydantic` for data validation/schemas and `MyPy` for static type checking.
*   **Naming Conventions**: Use `snake_case` for Python functions, variables, and file names. Use `PascalCase` for Classes and Pydantic models.
*   **Error Handling**:
    *   In the FastAPI backend, NEVER raise `HTTPException`. 
    *   ALWAYS raise `OnyxError` from `onyx.error_handling.exceptions`. A global exception handler automatically converts this cleanly to standard HTTP JSON responses.
    *   Example: `raise OnyxError(OnyxErrorCode.NOT_FOUND, "Session not found")`
*   **Modularity**: Keep database logic in `onyx/db/` and out of API routers. Keep external API integrations modularized in their respective connector logic.

## 3. API Development (FastAPI Setup & Routing)

*   **Application Bootstrapping**: The core API uses FastAPI and is initialized in `onyx/main.py`. The `get_application` function builds the app, applying global exception handlers and configuring the `lifespan` context (used for DB connection warmups and resource cleanup).
*   **Middleware Configuration**:
    *   **Auth**: Managed via `fastapi_users` integration. It supports session-based JWT cookies and standard OAuth providers (Google, OIDC, SAML). Endpoints are secured via dependencies like `Depends(current_user)` or the `check_router_auth` wrapper.
    *   **Logging & Tracking**: Custom middlewares intercept requests. `add_onyx_request_id_middleware` attaches trace IDs to requests for log correlation. `add_onyx_tenant_id_middleware` detects multi-tenant contexts for Enterprise routing.
    *   **CORS**: Standard `CORSMiddleware` handles cross-origin policies based on deployment configs.
*   **Routing & Management**: The application strictly enforces modularity.
    *   Routers are separated by domain into directories like `onyx/server/features/` (e.g., chat, personas, tools) and `onyx/server/documents/` (e.g., connectors, credentials).
    *   These `APIRouter` objects are imported and registered in `main.py`.
    *   **CRITICAL RULE**: Do NOT use the `response_model` parameter in `@router.get/post` decorators. Instead, explicitly declare the return type signature on the Python function using standard type hints (which FastAPI automatically parses).

## 4. Database Interactions

*   **Architecture**: Postgres is the main relational store, interacted with via SQLAlchemy. Redis is used for caching/coordination. Vespa is the vector database for document search.
*   **Engine & Pools**: Asynchronous database operations use `async_sql_engine` for thread pooling, optimizing FastAPI's async capabilities.
*   **Multi-Tenancy Setup**: Always connect to the database via the `get_session_with_current_tenant` dependency. This ensures strict data isolation and compliance in multi-tenant Enterprise environments. 
*   **Data Models**: Database schema models and core CRUD operations must be confined to the `onyx/db/` or `ee/onyx/db/` directories. Do not write raw SQL or inline SQLAlchemy queries within API route handlers.
*   **Manual DB Interaction**: Connect manually via `docker exec -it onyx-relational_db-1 psql -U postgres -c "<SQL>"`

## 5. Model Server Connection & Usage

*   **Architecture & Purpose**: The Model Server (`model_server/main.py`) operates as a distinctly separated, lightweight FastAPI service running on a specific port (`MODEL_SERVER_PORT`, usually 9000). 
    *   *Why?* Its sole responsibility is to serve high-compute Machine Learning inference tasks (like HuggingFace `SentenceTransformers` and cross-encoders). By isolating this on a separate service, expensive blocking vector math does NOT block the primary FastAPI application's asynchronous thread pool.
*   **Connection Mechanism**: The primary backend (`onyx/main.py`) interfaces with the Model Server over the network via HTTP REST calls targeted at `MODEL_SERVER_HOST` (defaults to a Docker-internal alias or `localhost`).
*   **Usage Flow**:
    *   When the API processes a search query or indexes a document chunk, it dispatches the text payload via HTTP POST to the `/encoders/` endpoints exposed by the model server.
    *   See `onyx/natural_language_processing/search_nlp_models.py` for integration patterns. The wrapper functions dispatch the prompt/document, awaiting a high-dimensional normalized embedding array from the model server.
    *   The returned high-dimensional embeddings are then injected into the Vespa vector database for semantic indexing and retrieval.

## 6. Background Workers (Celery)

Onyx uses Celery for asynchronous task processing:
*   **Primary Worker** (`celery_app.py`): Coordinates core tasks.
*   **Docfetching Worker**: Fetches from external sources.
*   **Docprocessing Worker**: Chunks, embeds (via Model Server), and writes to Vespa.
*   **Beat Worker**: Celery's scheduler for periodic tasks.
**CRITICAL**: Always use `@shared_task` and never enqueue a task without an `expires=` argument.

## 7. Agent Instructions & Rules

*   **Cursor / Copilot Skills**: Specialized workflows and internal tools exist as Cursor skills. Refer to `../.cursor/skills/` (like `onyx-cli` for DB querying and `playwright` for E2E testing) when asked to perform specific integrations or testing.
*   **Service Availability**: Assume all services (API, Model Server, Vespa, Redis, Celery) are running. Check backend logs at `log/<service_name>_debug.log` if things are unresponsive.
*   **API Interactions**: When testing or making calls to the backend from scripts, usually prefer going through the frontend proxy (e.g., `http://localhost:3000/api/...`) to ensure standard auth/routing applies, unless specifically writing internal unit/integration tests.
