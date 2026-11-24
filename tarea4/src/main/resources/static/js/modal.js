let modal = document.getElementById("modal");
let closeModalBtn = document.getElementById("close-modal-btn");
let cancelNotaBtn = document.getElementById("cancel-nota-btn");
let saveNotaBtn = document.getElementById("save-nota-btn");
let modalInfo = document.getElementById("modal-info");
let notaSelect = document.getElementById("nota-select");
let modalError = document.getElementById("modal-error");

let currentAvistamientoId = null;
let currentNotaCell = null;

let openEvaluarModal = (avistamiento, notaCell) => {
  currentAvistamientoId = avistamiento.id;
  currentNotaCell = notaCell;
  modalInfo.innerText = `Avistamiento de ${avistamiento.nombre_ave} por ${avistamiento.nombre_voluntario} (${avistamiento.nombre_comuna}, ${avistamiento.dia})`;
  notaSelect.value = "";
  modalError.hidden = true;
  modalError.innerText = "";
  modal.style.display = "block";
};

let closeEvaluarModal = () => {
  modal.style.display = "none";
  currentAvistamientoId = null;
  currentNotaCell = null;
};

closeModalBtn.addEventListener("click", closeEvaluarModal);
cancelNotaBtn.addEventListener("click", closeEvaluarModal);

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeEvaluarModal();
  }
});

let validateNotaInput = (rawValue) => {
  if (!/^\d+$/.test(rawValue)) {
    return null;
  }
  let parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }
  return parsed;
};

let submitNota = () => {
  let nota = validateNotaInput(notaSelect.value);
  if (nota === null) {
    modalError.innerText = "Por favor, selecciona un número entero entre 1 y 7.";
    modalError.hidden = false;
    return;
  }

  modalError.hidden = true;

  fetch(`${window.origin}/post-nota`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      avistamiento_id: currentAvistamientoId,
      nota: nota,
    }),
  })
    .then(async (response) => {
      let data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la nota.");
      }
      return data;
    })
    .then((data) => {
      if (currentNotaCell) {
        currentNotaCell.innerText = data.promedio;
      }
      closeEvaluarModal();
    })
    .catch((error) => {
      modalError.innerText = error.message;
      modalError.hidden = false;
    });
};

saveNotaBtn.addEventListener("click", submitNota);
