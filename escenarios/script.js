const escenariosDePrueba = [
    document.getElementById("dia"),
    document.getElementById("noche"),
];

document.querySelectorAll("[data-pantalla-escenario]").forEach((boton) => {
    boton.addEventListener("click", () => {
        escenariosDePrueba.forEach((pantalla) => {
            if (pantalla) {
                pantalla.style.display = "none";
            }
        });

        const escenario = document.getElementById(boton.dataset.pantallaEscenario);
        escenario.style.display = "grid";
    });
});
