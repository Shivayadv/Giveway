import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    mongodb_uri: str = os.environ["MONGODB_URI"]
    jwt_secret: str = os.environ["JWT_SECRET"]
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_days: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@giveway.com")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "Admin@1234")
    admin_name: str = os.getenv("ADMIN_NAME", "Platform Admin")


settings = Settings()
