const escenarios = [
    {
        id: "desierto",
        nombre: "Desierto",
        descripcion: "Dunas bajo el sol.",
        capas: ["sol", "nube", "montana", "duna-lejana", "duna", "suelo"],
    },
    {
        id: "selva",
        nombre: "Selva",
        descripcion: "Vegetación tropical.",
        capas: ["sol", "nube", "arbol-izquierdo", "arbol-derecho", "arbol-central", "suelo"],
    },
    {
        id: "bosque",
        nombre: "Bosque",
        descripcion: "Árboles al fondo.",
        capas: ["sol", "nube", "arbol-central", "arbol-izquierdo", "arbol-derecho", "suelo"],
    },
    {
        id: "noche",
        nombre: "Noche",
        descripcion: "Luna, estrellas y montañas.",
        capas: ["luna", "estrella", "estrella", "estrella", "montana", "arbol-izquierdo", "suelo"],
    },
];

function crearCapa(nombre) {
    const capa = document.createElement("span");
    capa.className = `escenario-capa escenario-capa--${nombre}`;
    return capa;
}

function crearOpcionEscenario(escenario, seleccionado) {
    const boton = document.createElement("button");
    boton.className = "escenario-opcion";
    boton.type = "button";
    boton.setAttribute("aria-pressed", String(seleccionado));
    boton.dataset.escenario = escenario.id;

    const arte = document.createElement("span");
    arte.className = `escenario-arte escenario-arte--${escenario.id}`;
    arte.setAttribute("aria-hidden", "true");
    escenario.capas.forEach((capa) => arte.appendChild(crearCapa(capa)));

    const nombre = document.createElement("span");
    nombre.className = "escenario-opcion__nombre";
    nombre.textContent = escenario.nombre;

    const descripcion = document.createElement("span");
    descripcion.className = "escenario-opcion__descripcion";
    descripcion.textContent = escenario.descripcion;

    boton.append(arte, nombre, descripcion);
    return boton;
}

function iniciarSelectorEscenarios() {
    const selectorPrincipal = document.getElementById("selector-escenarios");
    const opciones = document.getElementById("opciones-escenario");
    const estado = document.getElementById("estado-escenario");
    const panelSeleccion = document.getElementById("seleccion-escenario");
    const pantallaPartida = document.getElementById("pantalla-partida");
    const tituloArena = document.getElementById("titulo-arena");
    const arena = document.getElementById("arena-combate");
    const botonSiguiente = document.getElementById("boton-siguiente-escenario");
    const botonVolver = document.getElementById("boton-volver-escenarios");

    if (
        !selectorPrincipal ||
        !opciones ||
        !estado ||
        !panelSeleccion ||
        !pantallaPartida ||
        !tituloArena ||
        !arena ||
        !botonSiguiente ||
        !botonVolver
    ) {
        return;
    }

    let escenarioSeleccionado = escenarios[0];

    escenarios.forEach((escenario, indice) => {
        const boton = crearOpcionEscenario(escenario, indice === 0);

        boton.addEventListener("click", () => {
            opciones.querySelectorAll(".escenario-opcion").forEach((opcion) => {
                opcion.setAttribute("aria-pressed", String(opcion === boton));
            });

            escenarioSeleccionado = escenario;
            estado.textContent = `Escenario seleccionado: ${escenario.nombre}`;
            selectorPrincipal.dataset.escenarioSeleccionado = escenario.id;
        });

        opciones.appendChild(boton);
    });

    estado.textContent = `Escenario seleccionado: ${escenarioSeleccionado.nombre}`;
    selectorPrincipal.dataset.escenarioSeleccionado = escenarioSeleccionado.id;

    botonSiguiente.addEventListener("click", () => {
        arena.dataset.escenario = escenarioSeleccionado.id;
        arena.setAttribute(
            "aria-label",
            `Arena de combate en el escenario ${escenarioSeleccionado.nombre.toLowerCase()}, con un león y un velocirraptor`
        );
        tituloArena.textContent = `Arena: ${escenarioSeleccionado.nombre}`;
        panelSeleccion.hidden = true;
        pantallaPartida.hidden = false;
        document.body.classList.add("escenarios-en-juego");

        window.dispatchEvent(new CustomEvent("arena:iniciada", {
            detail: { escenario: escenarioSeleccionado.id },
        }));
    });

    botonVolver.addEventListener("click", () => {
        pantallaPartida.hidden = true;
        panelSeleccion.hidden = false;
        document.body.classList.remove("escenarios-en-juego");

        window.dispatchEvent(new Event("arena:finalizada"));
    });
}

iniciarSelectorEscenarios();
