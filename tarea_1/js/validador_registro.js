// validacion formulario
const validarRegistro= () => {
    // funciones auxiliares
    const validadorMail = (mail) => {
        regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(mail);
    };
    const validadorNombre = (nombre) => nombre && nombre.length > 2;
    const validadorContrasena = (pswd) => /\d/.test(pswd) && pswd.length > 6;
    const validadorTelefono = (phone) => /\d{9}/.test(phone);
    const validadorRegion = (region) => region && region.length != 0;
    const validadorComuna = (comuna) => comuna && comuna.length != 0;

    let emailInput = document.getElementById("email");
    let nameInput = document.getElementById("name");
    let pswdInput = document.getElementById("contrasenna");
    let phoneInput = document.getElementById("phone");
    let regionSelect = document.getElementById("select-region");
    let comunaSelect = document.getElementById("select-comuna");

    let isValid = false;
    let msg = "";

    if (!validadorMail(emailInput.value)) {
        msg += "Ingresa un correo electrónico válido\n";
        emailInput.style.borderColor = "red"; // cambiar estilo con JS!!
    } else {
        emailInput.style.borderColor = "";
    }

    if (!validadorNombre(nameInput.value)) {
        msg += "Ingresa un nombre válido\n";
        nameInput.style.borderColor = "red";
    } else {
        nameInput.style.borderColor = "";
    }

    if (!validadorContrasena(pswdInput.value)) {
        msg += "Contraseña debe tener al menos 7 caracteres y un número\n";
        pswdInput.style.borderColor = "red";
    } else {
        pswdInput.style.borderColor = "";
    }

    if (!validadorTelefono(phoneInput.value)) {
        msg += "Ingresa un número de teléfono válido (9 dígitos)\n";
        phoneInput.style.borderColor = "red";
    } else {
        phoneInput.style.borderColor = "";
    }

    if (!validadorRegion(regionSelect.value)) {
        msg += "Selecciona una región\n";
        regionSelect.style.borderColor = "red";
    } else {
        regionSelect.style.borderColor = "";
    }

    if (!validadorComuna(comunaSelect.value)) {
        msg += "Selecciona una comuna\n";
        comunaSelect.style.borderColor = "red";
    } else {
        comunaSelect.style.borderColor = "";
    }

    if (msg === "") {
        msg = "Felicidades ya tienes una cuenta!";
        isValid = true;
        
        let nameLogin = nameInput.value;
        localStorage.setItem("nameLogin", nameLogin);

        const dateLogin = new Date().toISOString().split("T")[0];
        localStorage.setItem("dateLogin", dateLogin);

    }
    alert(msg);

    if (isValid) {
        window.location.href = "avistamientos.html";
    }
};


let submitBtn = document.getElementById("submit-btn");
if (submitBtn) {
    submitBtn.addEventListener("click", validarRegistro);
}

