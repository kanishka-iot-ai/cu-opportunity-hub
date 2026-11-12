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

def test_register_and_login_flow(client):
    test_uid = '25TEST8888'
    test_pass = 'MySecurePass2026'

    # 1. Register student
    reg_response = client.post('/api/auth/register', json={
        'uid': test_uid,
        'full_name': 'Test New Student',
        'password': f"  {test_pass}  ",  # test whitespace trimming
        'current_semester': 4,
        'cgpa': 8.75
    })
    assert reg_response.status_code in [200, 201]
    reg_data = reg_response.get_json()
    assert 'access_token' in reg_data
    assert reg_data['user']['uid'] == test_uid

    # 2. Login with uppercase UID
    login_uid = client.post('/api/auth/login', json={
        'identifier': test_uid,
        'password': test_pass
    })
    assert login_uid.status_code == 200
    assert login_uid.get_json()['user']['uid'] == test_uid

    # 3. Login with lowercase UID
    login_lower = client.post('/api/auth/login', json={
        'identifier': test_uid.lower(),
        'password': test_pass
    })
    assert login_lower.status_code == 200

    # 4. Login with email
    login_email = client.post('/api/auth/login', json={
        'identifier': f"{test_uid.lower()}@cuchd.in",
        'password': test_pass
    })
    assert login_email.status_code == 200

    # 5. Login with extra spaces around identifier and password
    login_spaced = client.post('/api/auth/login', json={
        'identifier': f"  {test_uid}  ",
        'password': f"  {test_pass}  "
    })
    assert login_spaced.status_code == 200

    # 6. Re-registration with same credentials is idempotent (returns 200 instead of 409)
    rereg = client.post('/api/auth/register', json={
        'uid': test_uid,
        'full_name': 'Test New Student',
        'password': test_pass
    })
    assert rereg.status_code == 200

    # Clean up test user
    with client.application.app_context():
        u = User.query.filter_by(uid=test_uid).first()
        if u:
            db.session.delete(u)
            db.session.commit()
