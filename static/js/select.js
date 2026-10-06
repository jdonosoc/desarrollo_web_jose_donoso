let selectRegion = document.getElementById("select-region");
let selectComuna = document.getElementById("select-comuna");

selectRegion.addEventListener("change", function() {
    let regionId = selectRegion.value;
    
    fetch(`/api/comunas/${regionId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al obtener las comunas");
        }
        return response.json();
    })
    .then(data => {
        selectComuna.innerHTML = "";
        data.forEach(comuna => {
            let option = document.createElement("option");
            option.value = comuna.id;
            option.textContent = comuna.nombre;
            selectComuna.appendChild(option);
        });
    })
});
