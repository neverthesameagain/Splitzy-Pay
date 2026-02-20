from flask import Flask
from config import Config
from app.extensions import db, migrate, bcrypt, jwt

def create_app():
    app = Flask(__name__)
    
    # Load config from .env (via Config class or direct)
    app.config.from_object('config.Config')

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    from app.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app