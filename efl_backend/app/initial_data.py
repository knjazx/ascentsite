from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


def create_first_admin():
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == settings.FIRST_ADMIN_EMAIL))
        if existing:
            print("Admin user already exists, skipping")
            return

        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            username=settings.FIRST_ADMIN_USERNAME,
            hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created: {settings.FIRST_ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    create_first_admin()
