const validarAvistamiento = (event) => {
    const validadorAve = (ave) => ave && ave.length != 0;
    const validadorLugar = (lugar) => lugar && lugar.trim().length > 2;
    const validadorDescripcion = (descripcion) => descripcion && descripcion.trim().length >= 10;
    const validadorFecha = (fecha) => {
        if (!fecha) return false;
        const fechaIngresada = new Date(fecha + "T00:00");
        return fechaIngresada <= new Date() && fechaIngresada.getFullYear() >= 2020;
    };
    const validadorHora = (fecha, hora) => {
        if (!hora) return false;
        if (!fecha) return true;
        return new Date(`${fecha}T${hora}`) <= new Date();
    };
    const validadorArchivos = (input) => {
        const extensiones = ["png", "jpg", "jpeg", "gif", "mp4", "webm", "mov"];
        if (input.files.length === 0) return false;
        for (const archivo of input.files) {
            const extension = archivo.name.split(".").pop().toLowerCase();
            if (!extensiones.includes(extension)) return false;
        }
        return true;
    };

    const aveInput = document.getElementById("select-ave");
    const lugarInput = document.getElementById("lugar");
    const descripcionInput = document.getElementById("descripcion");
    const fechaInput = document.getElementById("date");
    const horaInput = document.getElementById("time");
    const archivosInput = document.getElementById("files");

    let msg = "";

    if (!validadorAve(aveInput.value)) {
        msg += "Selecciona un ave\n";
        aveInput.style.borderColor = "red";
    } else {
        aveInput.style.borderColor = "";
    }

    if (!validadorLugar(lugarInput.value)) {
        msg += "Ingresa un lugar válido (mínimo 3 caracteres)\n";
        lugarInput.style.borderColor = "red";
    } else {
        lugarInput.style.borderColor = "";
    }

    if (!validadorDescripcion(descripcionInput.value)) {
        msg += "La descripción debe tener al menos 10 caracteres\n";
        descripcionInput.style.borderColor = "red";
    } else {
        descripcionInput.style.borderColor = "";
    }

    if (!validadorFecha(fechaInput.value)) {
        msg += "Ingresa una fecha válida (no futura y desde 2020)\n";
        fechaInput.style.borderColor = "red";
    } else {
        fechaInput.style.borderColor = "";
    }

    if (!validadorHora(fechaInput.value, horaInput.value)) {
        msg += "Ingresa una hora válida (no futura)\n";
        horaInput.style.borderColor = "red";
    } else {
        horaInput.style.borderColor = "";
    }

    if (!validadorArchivos(archivosInput)) {
        msg += "Adjunta archivos válidos (png, jpg, jpeg, gif, mp4, webm, mov)\n";
        archivosInput.style.borderColor = "red";
    } else {
        archivosInput.style.borderColor = "";
    }

    if (msg !== "") {
        event.preventDefault();
        alert(msg);
        return false;
    }

    return true;
};

const formAvistamiento = document.getElementById("registro-avistamiento");
if (formAvistamiento) {
    formAvistamiento.addEventListener("submit", validarAvistamiento);
}