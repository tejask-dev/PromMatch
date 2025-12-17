import os
from typing import List
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings

settings = get_settings()

class EmbeddingsService:
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.api_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding with retry logic"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.api_url,
                headers=headers,
                json={"inputs": text, "options": {"wait_for_model": True}}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    # Handle case where API returns list of list
                    if isinstance(result, list) and isinstance(result[0], list):
                        return result[0]
                    return result
                else:
                    error_text = await response.text()
                    raise Exception(f"Hugging Face API error: {response.status} - {error_text}")
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        import math
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(a * a for a in vec2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0
        return dot_product / (magnitude1 * magnitude2)
    
    def calculate_compatibility(self, similarity: float) -> int:
        # Scale [-1, 1] to [0, 100] more naturally
        # -1 -> 0, 0 -> 50, 1 -> 100
        score = (similarity + 1) * 50
        return max(0, min(100, int(score)))

