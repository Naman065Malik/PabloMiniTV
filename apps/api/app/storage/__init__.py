"""Storage package."""

from app.storage.base import StorageProtocol
from app.storage.local import LocalStorage

__all__ = ["LocalStorage", "StorageProtocol"]
