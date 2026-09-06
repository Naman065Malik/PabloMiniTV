"""Seed preflight validator — in-memory only, never writes to DB."""
from __future__ import annotations
from typing import List, Dict, Any

class ValidationIssue:
    def __init__(self, severity: str, code: str, message: str, show: str | None = None,
                 episode_id: str | None = None, content_group: str | None = None,
                 language: str | None = None, records: List[str] | None = None) -> None:
        self.severity = severity
        self.code = code
        self.message = message
        self.show = show
        self.episode_id = episode_id
        self.content_group = content_group
        self.language = language
        self.records = records or []

class SeedValidator:
    def __init__(self, records: List[Dict[str, Any]]) -> None:
        self.records = records
        self.issues: List[ValidationIssue] = []

    def validate(self) -> Dict[str, Any]:
        self.issues = []
        # A. JSON structure / required fields
        if not isinstance(self.records, list):
            self.issues.append(ValidationIssue("error", "BAD_FORMAT", "Top level must be an array."))
            return self._result()

        for idx, r in enumerate(self.records):
            if not isinstance(r, dict):
                self.issues.append(ValidationIssue("error", "BAD_RECORD", f"Record {idx} is not an object."))
                continue
            for f in ("episode_id", "show_title", "slug", "season_number", "episode_number",
                      "episode_title", "duration_seconds", "language", "content_group", "status"):
                if f not in r:
                    self.issues.append(ValidationIssue("error", "MISSING_FIELD",
                        f"Record {r.get('episode_id', idx)} missing '{f}'.", show=r.get("show_title"), episode_id=r.get("episode_id")))

        # B/C. Duration > 0 for published
        for r in self.records:
            if not isinstance(r, dict):
                continue
            dur = r.get("duration_seconds")
            if isinstance(dur, int) and dur <= 0:
                # Only block if published
                if r.get("status") == "published":
                    self.issues.append(ValidationIssue("error", "INVALID_DURATION",
                        f"Published episode {r.get('episode_id')} has invalid duration.",
                        show=r.get("show_title"), episode_id=r.get("episode_id")))

        # D. Duplicate (content_group, language)
        pair_map: Dict[tuple, List[str]] = {}
        for r in self.records:
            if isinstance(r, dict):
                cg = r.get("content_group")
                lang = r.get("language")
                if cg and lang:
                    pair_map.setdefault((cg, lang), []).append(str(r.get("episode_id")))
        for (cg, lang), ids in pair_map.items():
            if len(ids) > 1:
                # Find show from first record
                first = next((r for r in self.records if isinstance(r, dict) and r.get("content_group") == cg and r.get("language") == lang), {})
                self.issues.append(ValidationIssue("error", "DUPLICATE_CONTENT_GROUP_LANGUAGE",
                    f"Duplicate language variant for content_group '{cg}' / language '{lang}'.",
                    show=first.get("show_title"), content_group=cg, language=lang, records=ids))

        # E. Published episode without artwork
        for r in self.records:
            if isinstance(r, dict) and r.get("status") == "published":
                art = r.get("artwork_available") or []
                if not art:
                    self.issues.append(ValidationIssue("error", "MISSING_ARTWORK",
                        f"Published episode {r.get('episode_id')} ({r.get('episode_title')}) has no artwork.",
                        show=r.get("show_title"), episode_id=r.get("episode_id")))

        # F. Section for published shows
        # Group by slug to detect if a show has published episodes but no section
        published_shows = set()
        for r in self.records:
            if isinstance(r, dict) and r.get("status") == "published":
                published_shows.add(r.get("slug"))
        for slug in published_shows:
            show_recs = [r for r in self.records if isinstance(r, dict) and r.get("slug") == slug]
            sections = {r.get("section") for r in show_recs}
            # If all are null/None for a published show, but some episodes are draft — only block if any published
            # Actually rule: published show must have section. If any record for this slug has section null and shows published, block.
            has_published = any(r.get("status") == "published" for r in show_recs if isinstance(r, dict))
            has_section = any(r.get("section") for r in show_recs if isinstance(r, dict))
            if has_published and not has_section:
                self.issues.append(ValidationIssue("error", "MISSING_SECTION",
                    f"Show '{slug}' is published but has no section.", show=slug))

        # G. Season 0 — allowed, just label correctly; don't block
        # H. Draft allowed — already not blocked above

        errors = [i for i in self.issues if i.severity == "error"]
        warnings = [i for i in self.issues if i.severity == "warning"]
        return {
            "can_import": len(errors) == 0,
            "can_publish": len(errors) == 0 and len([i for i in self.issues if i.code in ("MISSING_SECTION", "MISSING_ARTWORK", "INVALID_DURATION")]) == 0,
            "summary": {
                "records_checked": len([r for r in self.records if isinstance(r, dict)]),
                "shows_detected": len({r.get("slug") for r in self.records if isinstance(r, dict) and r.get("slug")}),
                "errors": len(errors),
                "warnings": len(warnings),
            },
            "issues": [
                {
                    "severity": i.severity,
                    "code": i.code,
                    "show": i.show,
                    "content_group": i.content_group,
                    "language": i.language,
                    "message": i.message,
                    "episode_id": i.episode_id,
                    "records": i.records,
                }
                for i in self.issues
            ],
        }

    def _result(self) -> Dict[str, Any]:
        return {"can_import": False, "can_publish": False, "summary": {}, "issues": []}
