const toggleMetricasBtn = document.getElementById("toggle-metricas");
const seccionMetricas = document.getElementById("metricas");

toggleMetricasBtn.addEventListener("click", () => {
    seccionMetricas.hidden = !seccionMetricas.hidden;
    toggleMetricasBtn.textContent = seccionMetricas.hidden ? "Mostrar métricas" : "Ocultar métricas";

    if (!seccionMetricas.hidden) {
        actualizarMetricas();
    }
});

const contarPorTipo = (array, tipo) => {
    let acumulador = {}; //
    array.forEach(item => {
        const valor = item[tipo];
        if (acumulador[valor]) {
            acumulador[valor]++;
        }
        else {
            acumulador[valor] = 1;
        }
    });
    return acumulador;
};


const contarPorAnio = (array, fecha) => {
    let acumulador = {}; //
    array.forEach(item => {
        const anio = item[fecha].substring(0, 4);
        if (acumulador[anio]) {
            acumulador[anio]++;
        }
        else {
            acumulador[anio] = 1;
        }
    });
    return acumulador;
};

const contarPorLugar = (array, lugar) => {
    let acumulador = {}; //
    array.forEach(item => {
        const valor = item[lugar];
        if (acumulador[valor]) {
            acumulador[valor]++;
        }
        else {
            acumulador[valor] = 1;
        }
    });
    return acumulador;
};

let graficoVoluntariosAnio, graficoTipos, graficoLugares;

const actualizarMetricas = () => {

    // Gráfico de voluntarios por año
    
    if (graficoVoluntariosAnio) graficoVoluntariosAnio.destroy();

    const conteoAnios = contarPorAnio(voluntarios, "fechaRegistro");

    graficoVoluntariosAnio = new Chart(document.getElementById("grafico-voluntarios-anio"), {
        type: "bar",
        data: {
            labels: Object.keys(conteoAnios),
            datasets: [{ label: "Voluntarios registrados", data: Object.values(conteoAnios) }]
        }
    });

    // Gráfico de avistamientos por tipo

    if (graficoTipos) graficoTipos.destroy();

    const conteoTipos = contarPorTipo(avistamientos, "tipo");

    graficoTipos = new Chart(document.getElementById("grafico-tipos"), {
        type: "bar",
        data: {
            labels: Object.keys(conteoTipos),
            datasets: [{ label: "Avistamientos por tipo", data: Object.values(conteoTipos) }]
        }
    });

    // Gráfico de avistamientos por lugar

    if (graficoLugares) graficoLugares.destroy();

    const conteoLugares = contarPorLugar(avistamientos, "lugar");

    graficoLugares = new Chart(document.getElementById("grafico-lugares"), {
        type: "pie",
        data: {
            labels: Object.keys(conteoLugares),
            datasets: [{ label: "Avistamientos por Lugar", data: Object.values(conteoLugares) }]
        }
    });
};