import json
import os
import pytest       

@pytest.fixture
def app():
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["CORS_ORIGINS"] = "http://localhost:5173"
    from app import create_app
    app = create_app()
    app.config.update(TESTING=True)
    return app

def test_health(app):
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

def test_builder_resume_model_round_trip(app):
    from app.extensions import db
    from app.models import BuilderResume
    with app.app_context():
        row = BuilderResume(user_id="test-user", name="Test Resume", template="ats-classic",
                            data=json.dumps({"skills": ["Python", "React"], "achievements": ["Award"]}))
        db.session.add(row)
        db.session.commit()
        result = row.to_dict()
        assert result["name"] == "Test Resume"
        assert result["data"]["skills"] == ["Python", "React"]
        assert result["data"]["achievements"] == ["Award"]
