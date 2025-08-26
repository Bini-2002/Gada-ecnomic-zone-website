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
        hashed = auth.get_password_hash(password)
        if existing:
            existing.approved = True
            existing.email_verified = True
            existing.hashed_password = hashed
            if email and existing.email != email:
                existing.email = email
            db.commit()
            print(f"Admin user '{username}' updated (approved + email_verified).")
        else:
            user = models.User(
                username=username,
                email=email,
                hashed_password=hashed,
                role='admin',
                approved=True,
                email_verified=True,
            )
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
