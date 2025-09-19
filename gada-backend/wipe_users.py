import argparse
from database import SessionLocal, engine
import models


def wipe_users(confirm: bool):
    db = SessionLocal()
    try:
        if not confirm:
            print("Refusing to wipe users without --yes flag")
            return
        # delete dependent rows first: comments, likes, refresh tokens
        db.query(models.Comment).delete()
        db.query(models.PostLike).delete()
        db.query(models.RefreshToken).delete()
        # finally delete users
        db.query(models.User).delete()
        db.commit()
        print("All users and related rows deleted.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", action="store_true", help="Confirm wipe")
    args = parser.parse_args()
    wipe_users(args.yes)
