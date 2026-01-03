from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from firebase_admin import auth

# Initialize the security scheme
security = HTTPBearer()

def get_current_user(token=Depends(security)):
    """
    Validates the Firebase token.
    Returns the decoded token (user info) if valid.
    """
    try:
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token.credentials)
        return decoded_token
    except Exception:
        # Raise 401 if token is invalid
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )