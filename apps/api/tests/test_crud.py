"""CRUD tests for the admin show, season, and episode APIs."""

from __future__ import annotations

from fastapi.testclient import TestClient


def create_show(client: TestClient, title: str = "Example Show") -> dict:
    response = client.post(
        "/api/admin/shows",
        json={
            "title": title,
            "description": "An example description",
            "section": "Kids",
            "category": "Animation",
        },
    )
    assert response.status_code == 201
    return response.json()


def create_season(client: TestClient, show_id: int, season_number: int = 1) -> dict:
    response = client.post(
        f"/api/admin/shows/{show_id}/seasons",
        json={"season_number": season_number, "title": f"Season {season_number}"},
    )
    assert response.status_code == 201
    return response.json()


def create_episode(client: TestClient, season_id: int, content_group: str = "group-1") -> dict:
    response = client.post(
        f"/api/admin/seasons/{season_id}/episodes",
        json={
            "title": "Pilot",
            "description": "The pilot episode",
            "episode_number": 1,
            "duration_seconds": 120,
            "language": "en",
            "content_group": content_group,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_show_crud_and_list(client: TestClient) -> None:
    show = create_show(client)

    assert show["title"] == "Example Show"
    assert show["slug"] == "example-show"

    list_response = client.get("/api/admin/shows", params={"search": "example"})
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1
    assert list_response.json()["items"][0]["id"] == show["id"]

    get_response = client.get(f"/api/admin/shows/{show['id']}")
    assert get_response.status_code == 200

    update_response = client.patch(
        f"/api/admin/shows/{show['id']}",
        json={"title": "Updated Show", "section": "Family"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Show"
    assert update_response.json()["section"] == "Family"

    delete_response = client.delete(f"/api/admin/shows/{show['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/admin/shows/{show['id']}").status_code == 404


def test_get_nonexistent_show_returns_404(client: TestClient) -> None:
    response = client.get("/api/admin/shows/999")
    assert response.status_code == 404


def test_seasons_allow_zero_and_reject_duplicate_number(client: TestClient) -> None:
    show = create_show(client)

    trailers = create_season(client, show["id"], season_number=0)
    assert trailers["season_number"] == 0

    list_response = client.get(f"/api/admin/shows/{show['id']}/seasons")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    duplicate_response = client.post(
        f"/api/admin/shows/{show['id']}/seasons",
        json={"season_number": 0, "title": "Duplicate"},
    )
    assert duplicate_response.status_code == 409


def test_create_season_for_nonexistent_show_returns_404(client: TestClient) -> None:
    response = client.post("/api/admin/shows/999/seasons", json={"season_number": 0})
    assert response.status_code == 404


def test_episode_crud_and_uniqueness(client: TestClient) -> None:
    show = create_show(client)
    season = create_season(client, show["id"])
    episode = create_episode(client, season["id"])

    list_response = client.get(f"/api/admin/seasons/{season['id']}/episodes")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = client.patch(
        f"/api/admin/episodes/{episode['id']}",
        json={"title": "Updated Pilot", "duration_seconds": 180},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Pilot"
    assert update_response.json()["duration_seconds"] == 180

    duplicate_response = client.post(
        f"/api/admin/seasons/{season['id']}/episodes",
        json={
            "title": "Duplicate",
            "language": "en",
            "content_group": "group-1",
        },
    )
    assert duplicate_response.status_code == 409

    delete_response = client.delete(f"/api/admin/episodes/{episode['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/admin/episodes/{episode['id']}").status_code == 404


def test_episode_validation_and_nonexistent_season(client: TestClient) -> None:
    show = create_show(client)
    season = create_season(client, show["id"])

    negative_duration_response = client.post(
        f"/api/admin/seasons/{season['id']}/episodes",
        json={
            "title": "Invalid episode",
            "language": "en",
            "content_group": "invalid-duration",
            "duration_seconds": -1,
        },
    )
    assert negative_duration_response.status_code == 422

    missing_season_response = client.post(
        "/api/admin/seasons/999/episodes",
        json={"title": "Missing season", "language": "en", "content_group": "missing"},
    )
    assert missing_season_response.status_code == 404
