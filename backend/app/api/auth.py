from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.schemas.user import UserOut, UserCreate, LoginRequest, Token
from app.auth.jwt import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")
    
    access_token = create_access_token(subject=user.username)
    
    # Audit log
    audit = AuditLog(
        user_id=user.username,
        user_role=user.role.value,
        action="LOGIN",
        entity_type="USER",
        entity_id=str(user.id),
        description=f"User {user.username} logged into POLARIS Operations Center.",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()
    
    return Token(access_token=access_token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    users = db.query(User).all()
    return [UserOut.model_validate(u) for u in users]
