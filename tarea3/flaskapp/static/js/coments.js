const datosAvistamiento = document.getElementById("datos-avistamientos");
const avistamiento = datosAvistamiento ? JSON.parse(datosAvistamiento.textContent) : null;
const avistamientoId = avistamiento ? avistamiento.id : null;

const cargarComentarios = () => {
    if (!avistamientoId) return;

    fetch(`http://127.0.0.1:5000/get-comments-data/${avistamientoId}`)
    .then((response) => response.json())
    .then((data) => {
        const contenedor = document.getElementById("lista-comentarios");
        contenedor.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            contenedor.innerHTML = "<p>No hay comentarios aún.</p>";
            return;
        }

        data.data.forEach((c) => {
            const item = document.createElement("div");
            item.className = "comentario-item";

            const header = document.createElement("p");
            header.className = "comentario-header";
            const strong = document.createElement("strong");
            strong.textContent = c.nombre;
            const small = document.createElement("small");
            small.className = "comentario-fecha";
            small.textContent = `(${c.fecha})`;
            header.appendChild(strong);
            header.appendChild(small);

            const body = document.createElement("p");
            body.className = "comentario-texto";
            body.textContent = c.texto;

            item.appendChild(header);
            item.appendChild(body);
            contenedor.appendChild(item);
        });
    })
    .catch((error) => console.error("Error", error));
};

const formComentario = document.getElementById("form-comentario");
if (formComentario) {
    formComentario.addEventListener("submit", (e) => {
        const nombreInput = document.getElementById("nombre");
        const textoInput = document.getElementById("texto");

        const validadorNombre = (nombre) => {
            if (!nombre) return false;
            const largo = nombre.trim().length;
            return largo >= 3 && largo <= 50;
        };

        const validadorComentario = (comentario) => {
            if (!comentario) return false;
            const largo = comentario.trim().length;
            return largo >= 5 && largo <= 250;
        };

        let msg = "";

        if (!validadorNombre(nombreInput.value)) {
            msg += "El nombre debe tener entre 3 y 50 caracteres\n";
            nombreInput.style.borderColor = "red";
        } else {
            nombreInput.style.borderColor = "";
        }

        if (!validadorComentario(textoInput.value)) {
            msg += "El comentario debe tener entre 5 y 250 caracteres\n";
            textoInput.style.borderColor = "red";
        } else {
            textoInput.style.borderColor = "";
        }

        if (msg !== "") {
            e.preventDefault();
            alert(msg);
            return false;
        }

        e.preventDefault();
        const nombre = nombreInput.value.trim();
        const texto = textoInput.value.trim();

        fetch("http://127.0.0.1:5000/post-comment-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nombre: nombre,
                texto: texto,
                avistamiento_id: avistamientoId
            })
        })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.error || "Error al publicar");
                });
            }
            return response.json();
        })
        .then((data) => {
            nombreInput.value = "";
            textoInput.value = "";
            cargarComentarios();
        })
        .catch((error) => {
            console.error("Error", error);
            alert(error.message || "Error al publicar el comentario.");
        });
    });
}

cargarComentarios();
