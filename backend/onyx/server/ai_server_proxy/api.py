import httpx
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from onyx.auth.users import current_chat_accessible_user
from onyx.db.engine.sql_engine import get_session
from onyx.db.llm import fetch_default_llm_model
from onyx.db.models import User
from onyx.server.api_key_usage import check_api_key_usage
from onyx.server.manage.llm.models import LLMProviderView
from onyx.utils.logger import setup_logger

logger = setup_logger()

router = APIRouter(prefix="/ai/v1")

# Create a shared async client for the proxy
http_client = httpx.AsyncClient()


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy_ai_request(
    request: Request,
    path: str,
    _: User = Depends(current_chat_accessible_user),
    _api_key_usage_check: None = Depends(check_api_key_usage),
    db_session: Session = Depends(get_session),
) -> StreamingResponse:
    """
    Proxies requests to the default AI model provider configured in Onyx.
    This allows using Onyx as an OpenAI-compatible API gateway with Onyx's built-in auth.
    """
    model_config = fetch_default_llm_model(db_session)
    if not model_config:
        raise HTTPException(status_code=500, detail="No default LLM provider configured in Onyx.")

    provider = LLMProviderView.from_model(model_config.llm_provider)

    # Use configured api_base or fallback to the provided default
    api_base = provider.api_base
    if not api_base:
        api_base = "http://privatebox.local:12001/v1"
    
    # Ensure api_base doesn't have a trailing slash
    api_base = api_base.rstrip("/")

    # The request URL for the target server
    target_url = f"{api_base}/{path}"
    
    # If there are query parameters, append them
    if request.url.query:
        target_url = f"{target_url}?{request.url.query}"

    # Forward headers, but exclude host and content-length (httpx will handle these)
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    # Inject the provider's API key if available
    if provider.api_key:
        headers["Authorization"] = f"Bearer {provider.api_key}"

    # Asynchronously stream the body from the incoming request
    async def request_body_generator():
        async for chunk in request.stream():
            yield chunk

    logger.debug(f"Proxying request to {target_url}")

    # Build the request to the upstream server
    req = http_client.build_request(
        method=request.method,
        url=target_url,
        headers=headers,
        content=request_body_generator(),
        # Pass a long timeout for LLM generation
        timeout=httpx.Timeout(timeout=300.0)
    )

    try:
        # Send the request and stream the response back
        upstream_response = await http_client.send(req, stream=True)
        
        # Prepare headers to send back to the client
        response_headers = dict(upstream_response.headers)
        
        # Remove headers that could cause issues with StreamingResponse
        response_headers.pop("content-encoding", None)
        response_headers.pop("content-length", None)
        response_headers.pop("transfer-encoding", None)

        return StreamingResponse(
            upstream_response.aiter_raw(),
            status_code=upstream_response.status_code,
            headers=response_headers,
            background=upstream_response.aclose
        )
    except httpx.RequestError as exc:
        logger.error(f"Error proxying request to {target_url}: {exc}")
        raise HTTPException(
            status_code=502,
            detail=f"Error communicating with upstream AI provider: {exc}"
        )
