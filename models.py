from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String

class Base(DeclarativeBase):
    pass

class region(Base):
    __tablename__ = "region"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)

class comuna(Base):
    __tablename__ = "comuna"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    region_id: Mapped[int] = mapped_column(nullable=False)

class voluntario(Base):
    __tablename__ = "voluntario"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    telefono: Mapped[int] = mapped_column(nullable=False)
    fecha_registro: Mapped[datetime] = mapped_column(nullable=False)
    comuna_id: Mapped[int] = mapped_column(nullable=False)

class ave(Base):
    __tablename__ = "ave"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)

class avistamiento(Base):
    __tablename__ = "avistamiento"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    voluntario_id: Mapped[int] = mapped_column(nullable=False)
    ave_id: Mapped[int] = mapped_column(nullable=False)
    fecha_hora: Mapped[datetime] = mapped_column(nullable=False)
    lugar: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)

class registroModel(Base):
    __tablename__ = "registro"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ruta_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    avistamiento_id: Mapped[int] = mapped_column(nullable=False)