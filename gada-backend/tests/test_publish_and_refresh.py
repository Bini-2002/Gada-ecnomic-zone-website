from datetime import datetime, timedelta
import models, auth

# Integration style test: schedule post then publish via job, ensure refresh still works

def test_scheduled_publish_and_refresh(client, create_admin, db_session):
    admin = create_admin()
    # login admin
    login = client.post('/token', data={'username':admin.username,'password':'AdminPass1!'}, headers={'Content-Type':'application/x-www-form-urlencoded'})
    assert login.status_code == 200
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type':'application/json'}
    # create scheduled post
    future = datetime.utcnow() + timedelta(seconds=1)
    create_resp = client.post('/posts', json={
        'title':'scheduled','date':'2025-01-01','details':'x','image':'img.jpg','status':'scheduled','publish_at': future.isoformat()
    }, headers=headers)
    assert create_resp.status_code == 200, create_resp.text
    # simulate job by calling tasks endpoint after waiting
    import time; time.sleep(1.2)
    pub_resp = client.post('/tasks/publish-scheduled', headers=headers)
    assert pub_resp.status_code == 200
    # refresh access token via cookie
    r = client.post('/token/refresh')
    assert r.status_code == 200
    # ensure post visible to non-admin after publish
    posts_public = client.get('/posts')
    assert posts_public.status_code == 200
    items = posts_public.json()['items']
    assert any(p['title']=='scheduled' for p in items)
