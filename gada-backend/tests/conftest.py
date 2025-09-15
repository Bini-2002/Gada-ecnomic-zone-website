import os, sys, tempfile, pytest
# Ensure project root (gada-backend) is on sys.path so tests can import modules directly
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
# Ensure SECRET_KEY set before importing application modules
os.environ.setdefault('SECRET_KEY', 'test_secret_key')
os.environ.setdefault('DISABLE_SCHEDULER', '1')
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models, database, main, auth

# Create a fresh SQLite DB per test session
@pytest.fixture(scope='session')
def test_engine():
    fd, path = tempfile.mkstemp(prefix='test_gada_', suffix='.db')
    os.close(fd)
    url = f'sqlite:///{path}'
    engine = create_engine(url, connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=engine)
    try:
        yield engine
    finally:
        # Dispose engine to release SQLite file handles on Windows before unlink
        try:
            engine.dispose()
        except Exception:
            pass
        os.unlink(path)

@pytest.fixture()
def db_session(test_engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

# Override dependency
@pytest.fixture()
def client(db_session, monkeypatch):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    main.app.dependency_overrides[database.get_db] = override_get_db
    # Ensure SECRET_KEY set
    # Already set globally; keep for explicitness
    monkeypatch.setenv('SECRET_KEY', 'test_secret_key')
    return TestClient(main.app)

@pytest.fixture()
def create_user(db_session):
    def _create(username='u1', email='u1@example.com', password='Passw0rd!'):
        hashed = auth.get_password_hash(password)
        user = models.User(username=username, email=email, hashed_password=hashed, role='user', approved=True, email_verified=True)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    return _create

@pytest.fixture()
def create_admin(db_session):
    def _create(username='admin', email='admin@example.com', password='AdminPass1!'):
        hashed = auth.get_password_hash(password)
        user = models.User(username=username, email=email, hashed_password=hashed, role='admin', approved=True, email_verified=True)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    return _create
