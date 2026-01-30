from typing import List
from sqlalchemy.orm import Session
from repositories.compliance_repository import PolicyRepository, FAQRepository, ReminderRepository


class ComplianceService:
    def __init__(self, db: Session):
        self.policy_repo = PolicyRepository(db)
        self.faq_repo = FAQRepository(db)
        self.reminder_repo = ReminderRepository(db)

    def get_policies(self, search: str = None) -> List:
        """Get policies"""
        if search:
            return self.policy_repo.search(search)
        return self.policy_repo.get_all()

    def get_faqs(self, category: str = None) -> List:
        """Get FAQs"""
        if category:
            return self.faq_repo.get_by_category(category)
        return self.faq_repo.get_all()

    def get_user_reminders(self, user_id: int) -> List:
        """Get user reminders"""
        return self.reminder_repo.get_by_user(user_id)
