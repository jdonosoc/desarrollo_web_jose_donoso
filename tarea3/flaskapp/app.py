from datetime import datetime

from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import hashlib
import filetype
import os
import uuid

from utils.validations import validate_name, validate_email, validate_phone, validate_region
from utils.validations import validate_comuna, validate_register_user, validate_file, validate_avistamiento, validate_comentario
from models import region, comuna, voluntario, ave, avistamiento, registroModel, comentarioModel

from sqlalchemy import create_engine, text
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Mapped
from sqlalchemy import String
from sqlalchemy import select, func

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
            "id": fila.avistamiento.id,
            "ave": fila.nombre_ave,
            "lugar": fila.avistamiento.lugar,
            "voluntario": fila.nombre_voluntario,
            "fecha": fila.avistamiento.fecha_hora.strftime("%Y-%m-%d %H:%M"),
            "archivo": primer_registro.nombre_archivo if primer_registro else "",
            "ruta": primer_registro.ruta_archivo if primer_registro else ""
        })

    return render_template("listado.html", aves=aves, avistamientos=lista_avistamientos)

@app.route("/avistamiento/<int:avistamiento_id>")
def visualizar_avistamiento(avistamiento_id):
    sessiondb = getSession()
    fila = sessiondb.execute(
        select(avistamiento, ave.nombre.label("nombre_ave"), voluntario.nombre.label("nombre_voluntario"))
        .join(ave, avistamiento.ave_id == ave.id)
        .outerjoin(voluntario, avistamiento.voluntario_id == voluntario.id)
        .where(avistamiento.id == avistamiento_id)
    ).first()

    primer_registro = sessiondb.scalars(
        select(registroModel).where(registroModel.avistamiento_id == avistamiento_id)
    ).first()

    datos = {
        "id": fila.avistamiento.id,
        "ave": fila.nombre_ave,
        "lugar": fila.avistamiento.lugar,
        "voluntario": fila.nombre_voluntario or "Desconocido",
        "fecha": fila.avistamiento.fecha_hora.strftime("%Y-%m-%d %H:%M"),
        "archivo": primer_registro.nombre_archivo if primer_registro else "",
        "ruta": primer_registro.ruta_archivo if primer_registro else ""
    } if fila else None

    return render_template("visualizar_avistamiento.html", avistamiento=datos)

@app.route("/get-comments-data/<int:avistamiento_id>", methods=["GET"])
@cross_origin(origin="127.0.0.1", supports_credentials=True)
def get_comments_data(avistamiento_id):
    sessiondb = getSession()
    comentarios = sessiondb.scalars(
        select(comentarioModel)
        .where(comentarioModel.avistamiento_id == avistamiento_id)
        .order_by(comentarioModel.fecha.asc())
    ).all()

    data = [{
        "id": c.id,
        "nombre": c.nombre,
        "texto": c.texto,
        "fecha": c.fecha.strftime("%Y-%m-%d %H:%M")
    } for c in comentarios]

    return jsonify({"status": "ok", "data": data})


@app.route("/post-comment-data", methods=["POST"])
@cross_origin(origin="127.0.0.1", supports_credentials=True)
def post_comment_data():
    sessiondb = getSession()

    data = request.get_json()
    nombre = data.get("nombre", "").strip()
    texto = data.get("texto", "").strip()
    avistamiento_id = data.get("avistamiento_id")

    if not validate_comentario(nombre, texto) or not avistamiento_id:
        return jsonify({"status": "error", "data": "Datos inválidos"}), 400

    nuevo = comentarioModel(
        nombre=nombre,
        texto=texto,
        fecha=datetime.now(),
        avistamiento_id=int(avistamiento_id)
    )
    sessiondb.add(nuevo)
    sessiondb.commit()

    return jsonify({
        "status": "ok",
        "data": {
            "id": nuevo.id,
            "nombre": nuevo.nombre,
            "texto": nuevo.texto,
            "fecha": nuevo.fecha.strftime("%Y-%m-%d %H:%M")
        }
    })


@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")

@app.route("/get-stats-data", methods=["GET"])
@cross_origin(origin="127.0.0.1", supports_credentials=True)
def get_stats_data():
    sessiondb = getSession()
    
    consulta_dias = select(
        func.date(avistamiento.fecha_hora).label('fecha'),
        func.count(avistamiento.id).label('cantidad')
    ).group_by(func.date(avistamiento.fecha_hora))
    
    resultados_dias = sessiondb.execute(consulta_dias).all()
    lista_grafico_1 = [{"fecha": str(r.fecha), "cantidad": r.cantidad} for r in resultados_dias]

    consulta_aves = select(
        ave.nombre.label('nombre_ave'),
        func.count(avistamiento.id).label('cantidad')
    ).join(avistamiento, ave.id == avistamiento.ave_id).group_by(ave.nombre)
    
    resultados_aves = sessiondb.execute(consulta_aves).all()
    lista_grafico_2 = [{"ave": r.nombre_ave, "cantidad": r.cantidad} for r in resultados_aves]

    consulta_comunas = select(
        comuna.nombre.label('nombre_comuna'),
        func.count(voluntario.id).label('cantidad')
    ).join(voluntario, comuna.id == voluntario.comuna_id).group_by(comuna.nombre)
    
    resultados_comunas = sessiondb.execute(consulta_comunas).all()
    lista_grafico_3 = [{"comuna": r.nombre_comuna, "voluntarios": r.cantidad} for r in resultados_comunas]

    return jsonify({
        "grafico_dias": lista_grafico_1,
        "grafico_aves": lista_grafico_2,
        "grafico_comunas": lista_grafico_3
    })

def getSession():
    connection_string = "mysql+pymysql://cc5002:cc5002@localhost:3306/tarea2"
    engine = create_engine(connection_string, echo=True)
    return Session(engine)

if __name__ == "__main__":
    app.run(debug=True)