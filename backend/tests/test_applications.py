import pytest
from app import create_app

@pytest.fixture
def client_with_auth():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        # Login as student
        login_resp = client.post('/api/auth/login', json={
            'identifier': '25BIT10180',
            'password': 'student123'
        })
        token = login_resp.get_json()['access_token']
        yield client, token

def test_list_applications(client_with_auth):
    client, token = client_with_auth
    response = client.get('/api/applications', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert 'applications' in data
    assert 'valid_statuses' in data
    assert len(data['valid_statuses']) == 10

def test_update_application_status(client_with_auth):
    client, token = client_with_auth
    list_resp = client.get('/api/applications', headers={'Authorization': f'Bearer {token}'})
    apps = list_resp.get_json()['applications']
    assert len(apps) > 0
    app_id = apps[0]['id']

    # Update to 'Interview Scheduled'
    put_resp = client.put(f'/api/applications/{app_id}', headers={'Authorization': f'Bearer {token}'}, json={
        'status': 'Interview Scheduled',
        'personal_notes': 'Round 1 technical discussion scheduled with team.'
    })
    assert put_resp.status_code == 200
    updated_app = put_resp.get_json()['application']
    assert updated_app['current_status'] == 'Interview Scheduled'
    assert len(updated_app['history']) >= 1
