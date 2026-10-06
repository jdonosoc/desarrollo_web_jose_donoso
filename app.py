from datetime import datetime

from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from werkzeug.utils import secure_filename
import hashlib
import filetype
import os
import uuid

from utils.validations import validate_name, validate_email, validate_phone, validate_region
from utils.validations import validate_comuna, validate_register_user, validate_file, validate_avistamiento
from models import region, comuna, voluntario, ave, avistamiento, registroModel

from sqlalchemy import create_engine, text
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Mapped
from sqlalchemy import String

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = "s3cr3t_k3y"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


@app.route("/")
def index():
    sessiondb = getSession()
    filas = sessiondb.execute(
        select(avistamiento, ave.nombre.label("nombre_ave"), voluntario.nombre.label("nombre_voluntario"))
        .join(ave, avistamiento.ave_id == ave.id)
        .outerjoin(voluntario, avistamiento.voluntario_id == voluntario.id)
        .order_by(avistamiento.fecha_hora.desc())
        .limit(2)
    ).all()

    ultimos = []
    for fila in filas:
        ultimos.append({
            "ave": fila.nombre_ave,
            "lugar": fila.avistamiento.lugar,
            "voluntario": fila.nombre_voluntario or "Desconocido",
            "fecha": fila.avistamiento.fecha_hora.strftime("%d-%m-%Y %H:%M")
        })

    return render_template("index.html", ultimos=ultimos)

@app.route("/registro", methods=["GET", "POST"])
def registro():
    error = None
    registrados = None
    mensaje = None
    sessiondb = getSession()
    regiones = sessiondb.scalars(select(region)).all()
    if request.method == 'POST':
        form = {
            "nombre": request.form.get("name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "telefono": request.form.get("phone", "").strip(),
            "region": request.form.get("select-region", "").strip(),
            "comuna": request.form.get("select-comuna", "").strip(),
        }
        if validate_register_user(form['nombre'], form['email'], form['telefono'], form['region'], form['comuna']):
            voluntario_id = agrega_voluntarios(sessiondb, form['nombre'], form['email'], form['telefono'], datetime.now(), form['comuna'])
                            
            if (voluntario_id):
                mensaje = "Agregado nuevo voluntario " + form['nombre']
                session['voluntario_id'] = voluntario_id
            else:
                error = 'No se pudo agregar voluntario'
        else:
            error = 'No se pudo agregar voluntario'
    
    registrados = sessiondb.scalars(select(voluntario)).all()
    return render_template('registro.html', mensaje=mensaje, error=error, registrados=registrados, regiones=regiones)

def agrega_voluntarios(session, nombreForm, emailForm, telefonoForm, fechaRegistro, idcomunaForm):
    if not nombreForm or not emailForm or not telefonoForm or not idcomunaForm:
        return False
    registrado = voluntario(nombre=nombreForm, email=emailForm, telefono=int(telefonoForm), fecha_registro=fechaRegistro, comuna_id=int(idcomunaForm))
    try:
        session.add(registrado)
        session.commit()
        return registrado.id
    
    except Exception as e:
        app.logger.error("Error con base de datos: {0} ".format(str(e)))
        session.rollback()
    return False

@app.route('/api/comunas/<int:region_id>')
def obtener_comunas(region_id):
    session = getSession()

    comunas = session.scalars(select(comuna).where(comuna.region_id == region_id)).all()
    lista_comunas = []
    for c in comunas:
        lista_comunas.append({"id": c.id, "nombre": c.nombre})
    return jsonify(lista_comunas)


@app.route("/avistamiento", methods=["GET", "POST"])
def registroAvistamiento():
    error = None
    mensaje = None
    sessiondb= getSession()
    aves = sessiondb.scalars(select(ave)).all()
    voluntario_id = session.get('voluntario_id')

    if not voluntario_id:
        return redirect(url_for('registro'))

    if request.method == 'POST':
        form = {
                "ave_id": request.form.get("select-ave", "").strip(),
                "lugar": request.form.get("lugar", "").strip(),
                "fecha": request.form.get("date", "").strip(),
                "hora": request.form.get("time", "").strip(),
                "descripcion": request.form.get("descripcion", "").strip()
                }
        archivos = request.files.getlist("files")

        if not (form["fecha"] and form["hora"] and form["ave_id"] and form["lugar"]):
            error = "Todos los campos son obligatorios"
        else:
            try:
                fecha_str = f"{form['fecha']} {form['hora']}"
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M")

                if agrega_avistamiento(sessiondb, voluntario_id, form["ave_id"], form["lugar"], fecha_obj, archivos, form["descripcion"]):
                    mensaje = "Avistamiento registrado exitosamente"
                else:
                    error = "No se pudo guardar el avistamiento"
            except ValueError:
                error = "Formato de fecha u hora no válido"

    return render_template("avistamiento.html", aves=aves, mensaje=mensaje, error=error)

def agrega_avistamiento(session, voluntario_id, ave_id, lugar, fecha_hora, archivos, descripcion):
    if not voluntario_id or not ave_id or not lugar or not fecha_hora or not archivos:
        return False

    for f in archivos:
        if not validate_file(f):
            return False
        f.seek(0)

    nuevo_avistamiento = avistamiento(
        voluntario_id = voluntario_id,
        ave_id = int(ave_id),
        lugar = lugar,
        fecha_hora = fecha_hora,
        descripcion = descripcion
    )

    try:
        session.add(nuevo_avistamiento)
        session.flush()

        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

        for f in archivos:
            nombre_original = secure_filename(f.filename)
            _filename = hashlib.sha256((nombre_original + uuid.uuid4().hex).encode("utf-8")).hexdigest()
            _extension = filetype.guess(f).extension
            f.seek(0)
            archivo_guardado = f"{_filename}.{_extension}"

            f.save(os.path.join(app.config["UPLOAD_FOLDER"], archivo_guardado))

            nuevo_registro = registroModel(
                ruta_archivo=archivo_guardado,
                nombre_archivo=nombre_original,
                avistamiento_id=nuevo_avistamiento.id
            )
            session.add(nuevo_registro)

        session.commit()
        return True
    except Exception as e:
        app.logger.error("Error con base de datos: {0}".format(str(e)))
        session.rollback()
        return False

@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")

@app.route("/listado")
def listado():
    sessiondb = getSession()
    aves = sessiondb.scalars(select(ave)).all()
    filas = sessiondb.execute(
        select(avistamiento, ave.nombre.label("nombre_ave"), voluntario.nombre.label("nombre_voluntario"))
        .join(ave, avistamiento.ave_id == ave.id)
        .join(voluntario, avistamiento.voluntario_id == voluntario.id)
        .order_by(avistamiento.fecha_hora.desc())
    ).all()

    lista_avistamientos = []
    for fila in filas:
        primer_registro = sessiondb.scalars(
            select(registroModel).where(registroModel.avistamiento_id == fila.avistamiento.id)
        ).first()
        lista_avistamientos.append({
            "ave": fila.nombre_ave,
            "lugar": fila.avistamiento.lugar,
            "voluntario": fila.nombre_voluntario,
            "fecha": fila.avistamiento.fecha_hora.strftime("%Y-%m-%d %H:%M"),
            "archivo": primer_registro.nombre_archivo if primer_registro else "",
            "ruta": primer_registro.ruta_archivo if primer_registro else ""
        })

    return render_template("listado.html", aves=aves, avistamientos=lista_avistamientos)

def getSession():
    connection_string = "mysql+pymysql://cc5002:cc5002@localhost:3306/tarea2"
    engine = create_engine(connection_string, echo=True)
    return Session(engine)

if __name__ == "__main__":
    app.run(debug=True)