from flask import Blueprint, request, jsonify
from app.models import User
from app.extensions import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

# Signup API
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    
    new_user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        phone_number=data.get('phone_number'),
        hashed_password=hashed_pw,
        opening_balance=data.get('opening_balance', 0.0),
        current_balance=data.get('opening_balance', 0.0) 
    )
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


# Login API 
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.hashed_password, password):
        access_token = create_access_token(identity=str(user.user_id))
        return jsonify({"access_token": access_token}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# Fetch user Profile 
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    return jsonify({
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "current_balance": user.current_balance
    }), 200