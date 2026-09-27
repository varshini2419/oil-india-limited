from fastapi import APIRouter, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.rag_service import search_baghewala_rag

router = APIRouter()

class RagQueryPayload(BaseModel):
    query: Optional[str] = ""
    context: Optional[Dict[str, Any]] = None

@router.get("/rag/health")
@router.get("/v1/rag/health")
def rag_health():
    return {
        "available": True,
        "message": "Hosted Baghewala Historical RAG service is online and active.",
        "service": "baghewala-rag-fastapi"
    }

@router.post("/rag/query")
@router.post("/v1/rag/query")
def rag_query(payload: RagQueryPayload = Body(...)):
    return search_baghewala_rag(query=payload.query or "", context=payload.context or {})
