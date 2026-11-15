from pydantic import BaseModel
from typing import Optional, Any, List

class ResponseModel(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[Any]
