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

def test_recommendation_engine(client_with_auth):
    client, token = client_with_auth
    response = client.get('/api/recommendations', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'recommendations' in data
    assert len(data['recommendations']) > 0

    first_rec = data['recommendations'][0]
    rec_info = first_rec['recommendation']
    assert 'score' in rec_info
    assert 'eligibility_status' in rec_info
    assert 'breakdown' in rec_info
    assert 'reasons' in rec_info
    assert rec_info['score'] >= 0 and rec_info['score'] <= 100
