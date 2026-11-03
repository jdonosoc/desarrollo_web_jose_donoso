Highcharts.chart('line-chart-container', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Avistamientos registrados por día'
    },
    xAxis: {
        type: 'datetime',
        title: {
            text: 'Día'
        },
        dateTimeLabelFormats: {
            day: '%b %e, %Y'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Cantidad de avistamientos'
        },
        allowDecimals: false
    },
    tooltip: {
        xDateFormat: '%A, %e de %B de %Y',
        pointFormat: '<br/>Avistamientos: <b>{point.y}</b>'
    },
    series: [{
        name: 'Avistamientos',
        data: []
    }]
});

Highcharts.chart('torta-chart-container', {
    chart: {
        type: 'pie'
    },
    title: {
        text: 'Avistamientos por tipo de ave'
    },
    tooltip: {
        pointFormat: '<b>{point.y}</b> avistamientos ({point.percentage:.1f}%)'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.y}'
            }
        }
    },
    series: [{
        name: 'Avistamientos',
        colorByPoint: true,
        data: []
    }]
});

Highcharts.chart('bar-chart-container', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Voluntarios registrados por comuna'
    },
    xAxis: {
        type: 'category',
        title: {
            text: 'Comuna'
        }
    },
    yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
            text: 'Total de voluntarios registrados'
        }
    },
    tooltip: {
        pointFormat: 'Voluntarios registrados: <b>{point.y}</b>'
    },
    plotOptions: {
        column: {
            borderRadius: 3
        }
    },
    series: [{
        name: 'Voluntarios',
        data: []
    }]
});

fetch("http://127.0.0.1:5000/get-stats-data")
.then((response) => response.json())
.then((data) => {
    Highcharts.chart('line-chart-container', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Avistamientos registrados por día'
    },
    xAxis: {
        type: 'datetime',
        title: {
            text: 'Día'
        },
        dateTimeLabelFormats: {
            day: '%b %e, %Y'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Cantidad de avistamientos'
        },
        allowDecimals: false
    },
    tooltip: {
        xDateFormat: '%A, %e de %B de %Y',
        pointFormat: '<br/>Avistamientos: <b>{point.y}</b>'
    },
    series: [{
        name: 'Avistamientos',
        data: []
    }]
});

Highcharts.chart('torta-chart-container', {
    chart: {
        type: 'pie'
    },
    title: {
        text: 'Avistamientos por tipo de ave'
    },
    tooltip: {
        pointFormat: '<b>{point.y}</b> avistamientos ({point.percentage:.1f}%)'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.y}'
            }
        }
    },
    series: [{
        name: 'Avistamientos',
        colorByPoint: true,
        data: []
    }]
});

Highcharts.chart('bar-chart-container', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Voluntarios registrados por comuna'
    },
    xAxis: {
        type: 'category',
        title: {
            text: 'Comuna'
        }
    },
    yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
            text: 'Total de voluntarios registrados'
        }
    },
    tooltip: {
        pointFormat: 'Voluntarios registrados: <b>{point.y}</b>'
    },
    plotOptions: {
        column: {
            borderRadius: 3
        }
    },
    series: [{
        name: 'Voluntarios',
        data: []
    }]
});

fetch("http://127.0.0.1:5000/get-stats-data")
.then((response) => response.json())
.then((data) => {
    let graficoDias = data.grafico_dias.map(item => {
        const [year, month, day] = item.fecha
        .split("-")
        .map((part) => parseInt(part, 10));
        return [
            Date.UTC(year, month - 1, day),
            item.cantidad
        ];
    }).sort((a, b) => a[0] - b[0]);

    let graficoAves = data.grafico_aves.map(item => {
        return {
            name: item.ave,
            y: item.cantidad
        };
    });

    let graficoComunas = data.grafico_comunas.map(item => {
        return {
            name: item.comuna,
            y: item.voluntarios
        };
    });

    const chartDias = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "line-chart-container"
    );

    chartDias.update({
        series: [
            {
                data: graficoDias,
            },
        ],
    });

    const chartAves = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "torta-chart-container"
    );

    chartAves.update({
        series: [
            {
                data: graficoAves,
            },
        ],
    });

    const chartComunas = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "bar-chart-container"
    );

    chartComunas.update({
        series: [
            {
                data: graficoComunas,
            },
        ],
    });
})
.catch((error) => console.error("Error", error));

    let graficoAves = data.grafico_aves.map(item => {
        return {
            name: item.ave,
            y: item.cantidad
        };
    });

    let graficoComunas = data.grafico_comunas.map(item => {
        return {
            name: item.comuna,
            y: item.voluntarios
        };
    });

    const chartDias = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "line-chart-container"
    );

    chartDias.update({
        series: [
            {
                data: graficoDias,
            },
        ],
    });

    const chartAves = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "torta-chart-container"
    );

    chartAves.update({
        series: [
            {
                data: graficoAves,
            },
        ],
    });

    const chartComunas = Highcharts.charts.find(
        (chart) => chart && chart.renderTo.id === "bar-chart-container"
    );

    chartComunas.update({
        series: [
            {
                data: graficoComunas,
            },
        ],
    });
})
.catch((error) => console.error("Error", error));