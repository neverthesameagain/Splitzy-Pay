# Backend

We are using the Application Factory pattern (where Flask appis created in \_\_init__.py and imported into run.py) to avoid circular import errors.

## In the directory:

* **`app/`**: The core app. Contains our DB `models.py`, API `routes.py` (currently simply has a user table for testing), and `extensions.py` (which handles plugins like SQLAlchemy and JWT).
* **`migrations/`**: Tracks our database schema changes.
* **`run.py`**: The entry point to start the server.
* **`config.py`**: Loads our environment variables.
* **`requirements.txt`**: All the Python packages we need.

## Setting up:

1. **Activate a virtual environment**: 
   `python -m venv venv` then `source venv/bin/activate` (or `venv\Scripts\activate` on Windows).
2. **Install packages**: 
   `pip install -r requirements.txt`
3. **Set up environment**: 
   Create a `.env` file in this folder with your DB URL and secret keys (see the .env.example file for reference).
4. **Build the database**: 
   `flask db upgrade`
5. **Run it**: 
   `python run.py` 

---

## Auth APIs set up so far

All routes are prefixed with `/api/auth`. You can test them by sending requests using curl via the below apis.

### 1. Signup (`POST /signup`)
* **What it does:** Creates a new user and hashes their password.
* **Send this (JSON):** `first_name`, `last_name`, `email`, `password`, `phone_number`, `opening_balance`.
* **Returns:** Success message (201).

### 2. Login (`POST /login`)
* **What it does:** Verifies credentials and gives you a stateless JWT.
* **Send this (JSON):** `email`, `password`.
* **Returns:** `{"access_token": "<your_jwt_here>"}` (200).

### 3. Get Profile (`GET /profile`)
* **What it does:** Grabs the logged-in user's data without needing their ID in the URL.
* **Headers needed:** `Authorization: Bearer <your_access_token>`
* **Returns:** User's ID, name, email, phone, and current balance (200).