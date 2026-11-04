import pytest
from app import create_app, db
from app.models import User, StudentProfile

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_login_with_uid(client):
    response = client.post('/api/auth/login', json={
        'identifier': '25BIT10180',
        'password': 'student123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['uid'] == '25BIT10180'
    assert data['user']['role'] == 'STUDENT'

def test_login_with_email(client):
    response = client.post('/api/auth/login', json={
        'identifier': '25bit10180@cuchd.in',
        'password': 'student123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == '25bit10180@cuchd.in'

def test_login_invalid_password(client):
    response = client.post('/api/auth/login', json={
        'identifier': '25BIT10180',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401

def test_admin_login(client):
    response = client.post('/api/auth/login', json={
        'identifier': 'admin@cuchd.in',
        'password': 'admin123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['role'] == 'ADMIN'
