// validacion formulario
const validarRegistro= (event) => {
    // funciones auxiliares
    const validadorMail = (mail) => {
        regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(mail);
    };
    const validadorNombre = (nombre) => nombre && nombre.length > 2;
    const validadorTelefono = (phone) => /\d{9}/.test(phone);
    const validadorRegion = (region) => region && region.length != 0;
    const validadorComuna = (comuna) => comuna && comuna.length != 0;

    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const regionInput = document.getElementById("select-region");
    const comunaInput = document.getElementById("select-comuna");

    let msg = "";

    if (!validadorMail(emailInput.value)) {
        msg += "Ingresa un correo electrónico válido\n";
        emailInput.style.borderColor = "red";
    } else {
        emailInput.style.borderColor = "";
    }

    if (!validadorNombre(nameInput.value)) {
        msg += "Ingresa un nombre válido\n";
        nameInput.style.borderColor = "red";
    } else {
        nameInput.style.borderColor = "";
    }

    if (!validadorTelefono(phoneInput.value)) {
        msg += "Ingresa un número de teléfono válido (9 dígitos)\n";
        phoneInput.style.borderColor = "red";
    } else {
        phoneInput.style.borderColor = "";
    }

    if (!validadorRegion(regionInput.value)) {
        msg += "Selecciona una región\n";
        regionInput.style.borderColor = "red";
    } else {
        regionInput.style.borderColor = "";
    }

    if (!validadorComuna(comunaInput.value)) {
        msg += "Selecciona una comuna\n";
        comunaInput.style.borderColor = "red";
    } else {
        comunaInput.style.borderColor = "";
    }

    if (msg !== "") {
        event.preventDefault();
        alert(msg);
        return false;
    }

    return true;
};

const formRegistro = document.getElementById("form-registro");
if (formRegistro) {
    formRegistro.addEventListener("submit", validarRegistro);
}

