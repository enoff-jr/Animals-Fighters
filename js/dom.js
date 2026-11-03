const pantallas = new Map([
    ["battle-1", document.getElementById("battle-1")],
    ["modos", document.getElementById("modos")],
    ["seleccionpj", document.getElementById("seleccionpj")],
    ["dificultad", document.getElementById("dificultad")],
    ["selector-escenarios", document.getElementById("selector-escenarios")],
]);

const botonInicio = document.getElementById("boton-star");
const estadoEleccion = document.getElementById("estado-eleccion");
const botonesPersonaje = [...document.querySelectorAll("[data-personaje]")];
const botonesDificultad = [...document.querySelectorAll("[data-dificultad]")];
const botonesNavegacion = [...document.querySelectorAll("[data-pantalla]")];

const configuracionJuego = {
    personaje: "leon",
    dificultad: "normal",
};

function mostrarPantalla(idPantalla) {
    const destino = pantallas.get(idPantalla);

    if (!destino) {
        throw new Error(`No existe la pantalla "${idPantalla}".`);
    }

    pantallas.forEach((pantalla) => {
        pantalla.style.display = "none";
    });

    destino.style.display = idPantalla === "selector-escenarios" ? "grid" : "flex";
}

function seleccionarPersonaje(botonElegido) {
    configuracionJuego.personaje = botonElegido.dataset.personaje;

    botonesPersonaje.forEach((boton) => {
        boton.setAttribute("aria-pressed", String(boton === botonElegido));
    });

    const animal = animalesBase[configuracionJuego.personaje];
    estadoEleccion.textContent = `¡Has elegido al ${animal.nombre}!`;
}

function seleccionarDificultad(botonElegido) {
    configuracionJuego.dificultad = botonElegido.dataset.dificultad;

    botonesDificultad.forEach((boton) => {
        boton.setAttribute("aria-pressed", String(boton === botonElegido));
    });
}

botonInicio.addEventListener("click", () => mostrarPantalla("modos"));

document.addEventListener("keydown", (evento) => {
    const elementoActivo = evento.target;
    const estaEscribiendo = elementoActivo instanceof HTMLElement &&
        elementoActivo.closest("button, input, select, textarea, a");

    if (evento.key === "Enter" && !estaEscribiendo && pantallas.get("battle-1").style.display !== "none") {
        evento.preventDefault();
        mostrarPantalla("modos");
    }
});

document.querySelectorAll("#btn-rapida, #btn-torneo").forEach((boton) => {
    boton.addEventListener("click", () => mostrarPantalla("seleccionpj"));
});

botonesPersonaje.forEach((boton) => {
    boton.addEventListener("click", () => seleccionarPersonaje(boton));
});

botonesDificultad.forEach((boton) => {
    boton.addEventListener("click", () => seleccionarDificultad(boton));
});

botonesNavegacion.forEach((boton) => {
    boton.addEventListener("click", () => mostrarPantalla(boton.dataset.pantalla));
});

document.addEventListener("pointermove", (evento) => {
    document.body.style.setProperty("--cursor-x", `${evento.clientX}px`);
    document.body.style.setProperty("--cursor-y", `${evento.clientY}px`);
});
