from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from .base import Base
from sqlalchemy.orm import relationship


class Photo(Base):
    __tablename__ = "photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hunt_id = Column(
        UUID(as_uuid=True), ForeignKey("hunts.id", ondelete="CASCADE"), nullable=False
    )
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(50), nullable=False)
    url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=False)
    caption = Column(Text, nullable=True)
    taken_at = Column(DateTime(timezone=True), nullable=True)
    location = Column(JSONB, nullable=True)
    exif_data = Column(JSONB, nullable=True)
    tags = Column(ARRAY(Text), default=[])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    hunt = relationship("Hunt", back_populates="photos")

    def __repr__(self):
        return f"<Photo {self.filename}>"
