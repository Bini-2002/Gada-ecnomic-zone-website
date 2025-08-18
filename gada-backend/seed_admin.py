"""Seed an initial admin user if none exists.
Usage (PowerShell):
  $env:PYTHONPATH='.'; python seed_admin.py --username admin --email admin@example.com --password Admin123!
"""
import argparse
from sqlalchemy.orm import Session
import database, models, auth

def seed(username: str, email: str, password: str):
    db: Session = next(database.get_db())
    try:
        existing = db.query(models.User).filter(models.User.username == username).first()
        if existing:
            print("User already exists; skipping")
            return
        hashed = auth.get_password_hash(password)
        user = models.User(username=username, email=email, hashed_password=hashed, role='admin', approved=True)
        db.add(user)
        db.commit()
        print(f"Admin user '{username}' created.")
    finally:
        db.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--username', required=True)
    parser.add_argument('--email', required=True)
    parser.add_argument('--password', required=True)
    args = parser.parse_args()
    seed(args.username, args.email, args.password)
