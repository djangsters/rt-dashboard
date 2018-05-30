import json


def test_dashboard_ok(client):
    response = client.get('/')
    assert response.status_code == 200


def test_queues_list_json(client):
    response = client.get('/queues.json')
    assert response.status_code == 200
    data = json.loads(response.data.decode('utf8'))
    assert len(data['queues']) == 3


def test_workers_list_json(client):
    response = client.get('/workers.json')
    assert response.status_code == 200
    data = json.loads(response.data.decode('utf8'))
    assert data['workers'] == []
