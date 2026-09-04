import os

from .base import StorageProtocol


class LocalStorage(StorageProtocol):
    def __init__(self, base_path: str):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)

    def put(self, key: str, data: bytes) -> None:
        path = os.path.join(self.base_path, key)
        with open(path, "wb") as f:
            f.write(data)

    def get(self, key: str) -> bytes:
        path = os.path.join(self.base_path, key)
        with open(path, "rb") as f:
            return f.read()

    def delete(self, key: str) -> None:
        path = os.path.join(self.base_path, key)
        if os.path.exists(path):
            os.remove(path)

    def exists(self, key: str) -> bool:
        return os.path.exists(os.path.join(self.base_path, key))
