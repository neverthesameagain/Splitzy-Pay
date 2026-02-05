erDiagram

    USER {
        int user_id PK
        string first_name
        string last_name
        string phone_number
        string email
        date date_of_birth
        string gender
        float opening_balance
        datetime created_at
        string hashed_password
    }

    EXPENSE_GROUP {
        int group_id PK
        string group_name
        datetime created_at
    }

    GROUP_MEMBER {
        int group_id PK
        int user_id PK
        datetime joined_at
        string role
    }

    CATEGORY {
        int category_id PK
        string category_name
    }

    EXPENSE {
        int expense_id PK
        int group_id
        int paid_by
        int paid_for
        int payment_id
        float amount
        string description
    }

    PERSONAL_SPLIT {
        int user_id PK
        int category_id PK
        float split
    }

    PAYMENT {
        int payment_id PK
        int from_user
        int to_user
        int category_id
        string payment_type
        string status
        int ledger_id
    }

    LEDGER {
        int ledger_id PK
        string entry_type
        int reference_id
        datetime created_at
        float amount
    }

    FUTURE_EXPENSE {
        int future_expense_id PK
        int user_id
        int category_id
        float estimated_amount
        date expected_date
        string status
    }

    UPI {
        int upi_id PK
        int user_id
    }

    USER ||--o{ GROUP_MEMBER
    EXPENSE_GROUP ||--o{ GROUP_MEMBER

    EXPENSE_GROUP ||--o{ EXPENSE
    USER ||--o{ EXPENSE

    USER ||--o{ PERSONAL_SPLIT
    CATEGORY ||--o{ PERSONAL_SPLIT

    USER ||--o{ PAYMENT
    CATEGORY ||--o{ PAYMENT

    LEDGER ||--|| PAYMENT
    LEDGER ||--|| EXPENSE

    USER ||--o{ FUTURE_EXPENSE
    CATEGORY ||--o{ FUTURE_EXPENSE

    USER ||--o{ UPI
