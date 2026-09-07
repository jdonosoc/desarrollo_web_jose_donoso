// DATOS SIMULADOS DE AVISTAMIENTOS Y VOLUNTARIOS

const avistamientos = [
    { ave: "Cóndor Andino", tipo: "Rapaz (aves de presa)", lugar: "Los Andes", fecha: "2025-07-22", hora: "14:00", archivo: "condor.jpg", voluntario: "Juan" },
    { ave: "Picaflor Gigante", tipo: "Paseiforme (pájaros)", lugar: "Valparaíso", fecha: "2025-08-10", hora: "09:30", archivo: "picaflor.mp4", voluntario: "María" },
    { ave: "Bandurria", tipo: "Anseriforme (aves acuaticas)", lugar: "Pucón", fecha: "2025-06-05", hora: "17:45", archivo: "bandurria.jpg", voluntario: "Camila" },
    { ave: "Ñandú", tipo: "Corredoras", lugar: "Punta Arenas", fecha: "2025-05-18", hora: "11:20", archivo: "nandu.mp4", voluntario: "Diego" },
];

const voluntarios = [
    { nombre: "María", fechaRegistro: "2025-01-15" },
    { nombre: "Juan", fechaRegistro: "2025-02-20" },
    { nombre: "Camila", fechaRegistro: "2025-03-10" },
    { nombre: "Diego", fechaRegistro: "2025-04-05" },
    { nombre: "Valentina", fechaRegistro: "2025-05-18" },
    { nombre: "Andrés", fechaRegistro: "2025-06-22" },
    { nombre: "Francisca", fechaRegistro: "2025-07-30" },
];

// FUNCIONES DE SESIÓN Y ALMACENAMIENTO

//evita el acceso directo desde avistamientos.html sin iniciar sesión (solo permite el acceso si hay un nombre en el localstorage)
const verificarSesion = () => {
    const nombre = localStorage.getItem("name");
    if (!nombre) {
        window.location.href = "login.html";
    }
};

const voluntarioLocal = () => {
    const nameLogin = localStorage.getItem("nameLogin");
    const dateLogin = localStorage.getItem("dateLogin");

    if (nameLogin && dateLogin) {
        const existe = voluntarios.some(v => v.nameLogin === nameLogin);
        if (!existe) {
            voluntarios.push({ nameLogin: nameLogin, fechaRegistro: dateLogin });
        }
    }
};


// FUNCIONES DE ACTUALIZACIÓN DE LA TABLA

const toggleBtn = document.getElementById("toggle-listado");
const seccionListado = document.getElementById("listado-avistamientos"); //oculta por defecto

toggleBtn.addEventListener("click", () => {
    seccionListado.hidden = !seccionListado.hidden;
    toggleBtn.textContent = seccionListado.hidden ? "Mostrar listado de avistamientos" : "Ocultar listado de avistamientos";

    if (!seccionListado.hidden) {
        actualizarVista();
    }
});

let paginaActual = 1;
const registrosPorPagina = 5;

const indicadorPagina = (totalRegistros) => {
    const cantidadPaginas = Math.ceil(totalRegistros/registrosPorPagina);
    const totalPaginas = Math.max(1, cantidadPaginas); // Caso borde de no tener registros
    document.getElementById("indicador-pagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
};

const editarTabla = (datos) => {
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    cuerpoTabla.innerHTML = ""

    const inicio = (paginaActual - 1) *registrosPorPagina;
    const fin = inicio +registrosPorPagina;
    const datosPagina = datos.slice(inicio, fin);

    datosPagina.forEach(avistamiento => {
        const fila = document.createElement("tr");

        const celdaAve = document.createElement("td");
        celdaAve.textContent =avistamiento.ave;
        fila.appendChild(celdaAve);

        const celdaTipo = document.createElement("td");
        celdaTipo.textContent = avistamiento.tipo;
        fila.appendChild(celdaTipo);

        const celdaLugar = document.createElement("td");
        celdaLugar.textContent = avistamiento.lugar;
        fila.appendChild(celdaLugar);

        const celdaVoluntario =document.createElement("td");
        celdaVoluntario.textContent = avistamiento.voluntario
        fila.appendChild(celdaVoluntario);

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = avistamiento.fecha;
        fila.appendChild(celdaFecha);

        const celdaArchivo = document.createElement("td");
        celdaArchivo.textContent =  avistamiento.archivo;
        fila.appendChild(celdaArchivo);

        cuerpoTabla.appendChild(fila);
    });

    indicadorPagina(datos.length);
};

const configuracionOrden = {
    "Ave (A-Z)": { valor: "ave", direccion: "asc" },
    "Ave (Z-A)": { valor: "ave", direccion: "desc" },
    "Tipo (A-Z)": { valor: "tipo", direccion: "asc" },
    "Tipo (Z-A)": { valor: "tipo", direccion: "desc" },
    "Región (A-Z)": { valor: "lugar", direccion: "asc" },
    "Región (Z-A)": { valor: "lugar", direccion: "desc" },
    "Fecha (más reciente)": { valor: "fecha", direccion: "desc" },
    "Fecha (menos reciente)": { valor: "fecha", direccion: "asc" },
};

const actualizarVista = () => {
    const tipoSeleccionado = document.getElementById("filtro-tipo").value;
    const opcionOrden = document.getElementById("ordenar-por").value;

    let resultado = avistamientos.filter(a =>//filtro de tipo
        tipoSeleccionado ==="" || a.tipo ===tipoSeleccionado //selleciona todos por defecto o filtra por tipo
    );

    if (opcionOrden &&configuracionOrden[opcionOrden]) {
        const { valor, direccion } = configuracionOrden[opcionOrden];

    resultado.sort((a, b) => { //ordenamiento despues del filtro
        let valorA =a[valor];
        let valorB =b[valor];
        if (valorA < valorB) return direccion ==="asc"? -1 : 1;
        if (valorA > valorB) return direccion ==="asc"? 1 : -1;
        return 0;
    });
    }

    editarTabla(resultado);
};

// FUNCIONES DE VALIDACIÓN

const agregarRegistro = () => {
    const validadorAve = (ave) => ave && ave.length > 2;
    const validadorTipo = (tipo) => tipo && tipo.length != 0;
    const validadorRegion = (region) => region && region.length != 0;
    const validadorComuna = (comuna) => comuna && comuna.length != 0;
    const validadorFecha = (fecha) => {
        const fechaActual = new Date();
        const fechaIngresada = new Date(fecha);
        const annoIngresado = fechaIngresada.getFullYear();
        return fechaIngresada <= fechaActual && annoIngresado >= 2020;
    }
    const validadorArchivo = (archivo) => archivo && archivo.files.length != 0;

    let msg = "";

    let aveInput = document.getElementById("ave");
    let tipoSelect = document.getElementById("select-tipo");
    let regionSelect = document.getElementById("select-region");
    let comunaSelect = document.getElementById("select-comuna");
    let fechaInput = document.getElementById("date");
    let archivoInput = document.getElementById("files");

    const nombreValido = validadorAve(aveInput.value);
    const tipoValido = validadorTipo(tipoSelect.value);
    const regionValido = validadorRegion(regionSelect.value);
    const comunaValido = validadorComuna(comunaSelect.value);
    const fechaValido = validadorFecha(fechaInput.value);
    const archivoValido = validadorArchivo(archivoInput);

    if (!nombreValido) {
        msg += "Ingresa un nombre de ave válido\n";
        aveInput.style.borderColor = "red";
    } else {
        aveInput.style.borderColor = "";
    }

    if (!tipoValido) {
        msg += "Selecciona un tipo de ave\n";
        tipoSelect.style.borderColor = "red";
    } else {
        tipoSelect.style.borderColor = "";
    }

    if (!regionValido) {
        msg += "Selecciona una región\n";
        regionSelect.style.borderColor = "red";
    } else {
        regionSelect.style.borderColor = "";
    }

    if (!comunaValido) {
        msg += "Selecciona una comuna\n";
        comunaSelect.style.borderColor = "red";
    } else {
        comunaSelect.style.borderColor = "";
    }

    if (!fechaValido) {
        msg += "Ingresa una fecha válida (no mayor a la actual y no menor a 2020)\n";
        fechaInput.style.borderColor = "red";
    } else {
        fechaInput.style.borderColor = "";
    }

    if (!archivoValido) {
        msg += "Selecciona un archivo\n";
        archivoInput.style.borderColor = "red";
    } else {
        archivoInput.style.borderColor = "";
    }



    if (nombreValido && tipoValido && regionValido && comunaValido && fechaValido && archivoValido) {
        msg = "Avistamiento registrado con éxito!";
        avistamientos.push({
            ave: aveInput.value,
            tipo: tipoSelect.value,
            lugar: comunaSelect.value,
            voluntario: localStorage.getItem("name"),
            fecha: fechaInput.value,
            archivo: archivoInput.files[0].name
        });
        actualizarVista();
        formulario.reset();
        document.getElementById("select-comuna").innerHTML = '<option value="">Seleccione una comuna</option>';
    }
    alert(msg);
}

const formulario = document.getElementById("registro-avistamiento");

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    agregarRegistro();
});

document.getElementById("filtro-tipo").addEventListener("change", () => {
    paginaActual = 1;
    actualizarVista();
});

document.getElementById("ordenar-por").addEventListener("change", actualizarVista);

document.getElementById("pagina-anterior").addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        actualizarVista();
    }
});

document.getElementById("pagina-siguiente").addEventListener("click", () => {
    paginaActual++;
    actualizarVista();
});

//AL CARGAR LA PÁGINA
window.addEventListener("load", () => {
    verificarSesion();
    voluntarioLocal();
    actualizarVista();
});
