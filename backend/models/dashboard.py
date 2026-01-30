from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Widget(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    config = Column(JSON, nullable=True)

    # Relationships
    user_widgets = relationship("UserWidget", back_populates="widget")


class UserWidget(Base):
    __tablename__ = "user_widgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    widget_id = Column(Integer, ForeignKey("widgets.id"), nullable=False)
    position = Column(Integer, nullable=True)
    enabled = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="user_widgets")
    widget = relationship("Widget", back_populates="user_widgets")
