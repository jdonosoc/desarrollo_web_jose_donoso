const avistamientos = JSON.parse(document.getElementById("datos-avistamientos").textContent);
 
let paginaActual = 1;
const registrosPorPagina = 5;
 
const totalPaginasDe = (totalRegistros) => {
    const cantidadPaginas = Math.ceil(totalRegistros/registrosPorPagina);
    return Math.max(1, cantidadPaginas);
};
 
const indicadorPagina = (totalRegistros) => {
    const totalPaginas = totalPaginasDe(totalRegistros);
    document.getElementById("indicador-pagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
};
 
const editarTabla = (datos) => {
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    cuerpoTabla.innerHTML = ""
 
    const totalPaginas = totalPaginasDe(datos.length);
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }
 
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const datosPagina = datos.slice(inicio, fin);
 
    datosPagina.forEach(avistamiento => {
        const fila = document.createElement("tr");
 
        const celdaAve = document.createElement("td");
        celdaAve.textContent = avistamiento.ave;
        fila.appendChild(celdaAve);
 
        const celdaLugar = document.createElement("td");
        celdaLugar.textContent = avistamiento.lugar;
        fila.appendChild(celdaLugar);
 
        const celdaVoluntario = document.createElement("td");
        celdaVoluntario.textContent = avistamiento.voluntario;
        fila.appendChild(celdaVoluntario);
 
        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = avistamiento.fecha;
        fila.appendChild(celdaFecha);
 
        const celdaArchivo = document.createElement("td");
        if (avistamiento.ruta) {
            const enlace = document.createElement("a");
            enlace.href = `/static/uploads/${avistamiento.ruta}`;
            enlace.target = "_blank";
            enlace.textContent = avistamiento.archivo;
            celdaArchivo.appendChild(enlace);
        } else {
            celdaArchivo.textContent = avistamiento.archivo;
        }
        fila.appendChild(celdaArchivo);
 
        cuerpoTabla.appendChild(fila);
    });
 
    indicadorPagina(datos.length);
};
 
const configuracionOrden = {
    "Ave (A-Z)": { valor: "ave", direccion: "asc" },
    "Ave (Z-A)": { valor: "ave", direccion: "desc" },
    "Lugar (A-Z)": { valor: "lugar", direccion: "asc" },
    "Lugar (Z-A)": { valor: "lugar", direccion: "desc" },
    "Fecha (más reciente)": { valor: "fecha", direccion: "desc" },
    "Fecha (menos reciente)": { valor: "fecha", direccion: "asc" },
};
 
let resultadoActual = [];
 
const actualizarVista = () => {
    const aveSeleccionada = document.getElementById("filtro-ave").value;
    const opcionOrden = document.getElementById("ordenar-por").value;
 
    let resultado = avistamientos.filter(a =>
        aveSeleccionada === "" || a.ave === aveSeleccionada
    );
 
    if (opcionOrden && configuracionOrden[opcionOrden]) {
        const { valor, direccion } = configuracionOrden[opcionOrden];
 
        resultado.sort((a, b) => {
            let valorA = a[valor];
            let valorB = b[valor];
            if (valorA < valorB) return direccion === "asc" ? -1 : 1;
            if (valorA > valorB) return direccion === "asc" ? 1 : -1;
            return 0;
        });
    }
 
    resultadoActual = resultado;
    editarTabla(resultado);
};
 
document.getElementById("filtro-ave").addEventListener("change", () => {
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
    if (paginaActual < totalPaginasDe(resultadoActual.length)) {
        paginaActual++;
        actualizarVista();
    }
});

window.addEventListener("load", () => {
    actualizarVista();
});