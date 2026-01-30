from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    context: str = ""  # Optional context (e.g., current page, user role)


class ChatResponse(BaseModel):
    response: str
