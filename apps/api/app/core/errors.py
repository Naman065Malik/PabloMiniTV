"""Application-level exception handling."""

from __future__ import annotations


class AppError(Exception):
    """Base application exception."""

    def __init__(self, message: str = "Application error", status_code: int = 500) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class NotFoundError(AppError):
    def __init__(self, message: str = "Not found") -> None:
        super().__init__(message, 404)


class ConflictError(AppError):
    def __init__(self, message: str = "Conflict") -> None:
        super().__init__(message, 409)


class ValidationError(AppError):
    def __init__(self, message: str = "Validation error") -> None:
        super().__init__(message, 422)
