import os

from .base import StorageProtocol


class LocalStorage(StorageProtocol):
    def __init__(self, base_path: str = "/tmp/peblo_storage"):
        self.base_path = base_path
        import os
        os.makedirs(base_path, exist_ok=True)

    def _path(self, key: str) -> str:
        import os
        # Prevent path traversal: normalize and enforce under base_path
        safe = os.path.normpath(key).lstrip("/")
        if safe.startswith("..") or "/../" in safe or safe.startswith(".."):
            safe = safe.replace("..", "_")
        full = os.path.join(self.base_path, safe)
        # Final guard: must start with base_path
        real_base = os.path.realpath(self.base_path)
        real_full = os.path.realpath(full)
        if not real_full.startswith(real_base + os.sep) and real_full != real_base:
            raise ValueError("Invalid storage key: path traversal detected")
        return real_full

    def put(self, key: str, data: bytes) -> None:
        path = self._path(key)
        os.makedirs(os.path.dirname(path) or self.base_path, exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)

    def get(self, key: str) -> bytes:
        path = self._path(key)
        with open(path, "rb") as f:
            return f.read()

    def delete(self, key: str) -> None:
        path = self._path(key)
        if os.path.exists(path):
            os.remove(path)

    def exists(self, key: str) -> bool:
        return os.path.exists(self._path(key))
