from sqlalchemy import (
    Column,
    String,
    DateTime,
    Date,
    Time,
    Boolean,
    ForeignKey,
    Text,
    ARRAY,
    Table,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .base import Base


# Association table for many-to-many relationship
HuntDog = Table(
    "hunt_dogs",
    Base.metadata,
    Column(
        "hunt_id",
        UUID(as_uuid=True),
        ForeignKey("hunts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "dog_id",
        UUID(as_uuid=True),
        ForeignKey("dogs.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Hunt(Base):
    __tablename__ = "hunts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=True)
    location = Column(JSONB, nullable=False)
    weather = Column(JSONB, nullable=True)
    game_type = Column(ARRAY(Text), default=[])
    game_seen = Column(JSONB, default=[])
    game_harvested = Column(JSONB, default=[])
    notes = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    tags = Column(ARRAY(Text), default=[])
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="hunts")
    dogs = relationship("Dog", secondary=HuntDog, back_populates="hunts")
    tracks = relationship("Track", back_populates="hunt", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="hunt", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Hunt {self.title} on {self.date}>"
