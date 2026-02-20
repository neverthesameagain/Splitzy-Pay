from app.extensions import db
from datetime import datetime

class User(db.Model):

    user_id = db.Column(db.Integer, primary_key=True) 
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    opening_balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    hashed_password = db.Column(db.String(128), nullable=False)
    current_balance = db.Column(db.Float, default=0.0)

    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'
    