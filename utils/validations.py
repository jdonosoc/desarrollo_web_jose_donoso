import re
import filetype

def validate_name(nombre):
    # nombre && nombre.length > 2 (al menos 3 caracteres no vacíos)
    return bool(nombre and len(nombre.strip()) > 2)

def validate_email(email):
    # regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    return bool(email and re.match(email_regex, email.strip()))

def validate_phone(phone):
    # phone.length == 9 y solo dígitos
    phone_regex = r"^\d{9}$"
    return bool(phone and re.match(phone_regex, phone.strip()))

def validate_region(region):
    # region && region.length != 0
    return bool(region and str(region).strip() != "")

def validate_comuna(comuna):
    # comuna && comuna.length != 0
    return bool(comuna and str(comuna).strip() != "")

def validate_register_user(nombre, email, telefono, region, comuna):
    return (
        validate_name(nombre)
        and validate_email(email)
        and validate_phone(telefono)
        and validate_region(region)
        and validate_comuna(comuna)
    )

def validate_file(file):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "mp4", "webm", "mov"}
    ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/quicktime"}

    if file is None or file.filename == "":
        return False

    ftype_guess = filetype.guess(file)
    if ftype_guess is None:
        file.seek(0)
        return False

    if ftype_guess.extension not in ALLOWED_EXTENSIONS:
        file.seek(0)
        return False

    if ftype_guess.mime not in ALLOWED_MIMETYPES:
        file.seek(0)
        return False

    return True

def validate_avistamiento(nombre_ave, ave_id, lugar, fecha, files):
    if not (nombre_ave and len(nombre_ave.strip()) > 2):
        return False
    if not (ave_id and str(ave_id).strip() != ""):
        return False
    if not (lugar and len(lugar.strip()) > 2):
        return False
    if not (fecha and str(fecha).strip() != ""):
        return False
    if not files or len(files) == 0:
        return False

    for f in files:
        if not validate_file(f):
            return False

    return True