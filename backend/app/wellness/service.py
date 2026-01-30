from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from repositories.wellness_repository import InitiativeRepository, SessionRepository
from models.wellness import Initiative, Session as WellnessSession, SessionStatus


class WellnessService:
    def __init__(self, db: Session):
        self.initiative_repo = InitiativeRepository(db)
        self.session_repo = SessionRepository(db)

    def get_initiatives(self) -> List:
        """Get wellness initiatives"""
        initiatives = self.initiative_repo.get_all()
        result = []
        for init in initiatives:
            booked = self.session_repo.count_by_initiative(init.id)
            total = init.total_slots or 0
            result.append({
                **self._initiative_to_dict(init),
                "booked_slots": booked,
                "available_slots": max(0, total - booked),
            })
        return result

    def get_initiative_detail(self, initiative_id: int) -> Dict[str, Any]:
        """Get initiative by id with booked_slots and available_slots."""
        initiative = self.initiative_repo.get(initiative_id)
        if not initiative:
            raise HTTPException(status_code=404, detail="Initiative not found")
        booked_slots = self.session_repo.count_by_initiative(initiative_id)
        total_slots = initiative.total_slots or 0
        available_slots = max(0, total_slots - booked_slots)
        return {
            **self._initiative_to_dict(initiative),
            "booked_slots": booked_slots,
            "available_slots": available_slots,
        }

    def book_session(self, initiative_id: int, user_id: int) -> Dict[str, Any]:
        """Book a session for the user. Raises HTTPException if invalid."""
        initiative = self.initiative_repo.get(initiative_id)
        if not initiative:
            raise HTTPException(status_code=404, detail="Initiative not found")
        if self.session_repo.exists_for_user(initiative_id, user_id):
            raise HTTPException(status_code=400, detail="Already booked for this initiative")
        booked_slots = self.session_repo.count_by_initiative(initiative_id)
        total_slots = initiative.total_slots or 0
        if total_slots <= 0 or booked_slots >= total_slots:
            raise HTTPException(status_code=400, detail="No slots available")
        session = WellnessSession(
            initiative_id=initiative_id,
            user_id=user_id,
            status=SessionStatus.APPROVED,
        )
        created = self.session_repo.create(session)
        return {"id": created.id, "initiative_id": initiative_id, "message": "Booked successfully"}

    def cancel_booking(self, session_id: int, user_id: int) -> None:
        """Cancel user's booking. Raises HTTPException if not found."""
        if not self.session_repo.delete_by_id_and_user(session_id, user_id):
            raise HTTPException(status_code=404, detail="Booking not found")

    def get_user_sessions(self, user_id: int) -> List:
        """Get user wellness sessions"""
        return self.session_repo.get_by_user(user_id)

    @staticmethod
    def _initiative_to_dict(initiative: Initiative) -> Dict[str, Any]:
        return {c.name: getattr(initiative, c.name) for c in Initiative.__table__.columns}
