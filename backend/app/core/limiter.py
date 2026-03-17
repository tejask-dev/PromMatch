"""
Shared rate limiter instance.
Import this in main.py and all endpoint files.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
