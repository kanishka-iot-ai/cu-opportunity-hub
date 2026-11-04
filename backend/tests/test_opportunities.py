import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_opportunities(client):
    response = client.get('/api/opportunities')
    assert response.status_code == 200
    data = response.get_json()
    assert 'opportunities' in data
    assert data['total'] > 0

def test_search_opportunities(client):
    response = client.get('/api/opportunities?q=Google')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['opportunities']) >= 1
    assert 'Google' in data['opportunities'][0]['title']

def test_filter_by_category(client):
    response = client.get('/api/opportunities?category_slug=hackathons')
    assert response.status_code == 200
    data = response.get_json()
    assert all(o['category_slug'] == 'hackathons' for o in data['opportunities'])

def test_get_categories_meta(client):
    response = client.get('/api/opportunities/meta/categories')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['categories']) == 20
