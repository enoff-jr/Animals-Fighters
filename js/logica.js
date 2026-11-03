const registroCombate = document.getElementById("battle-log");
const mensajeInicial = document.getElementById("mnsjInicial");
const cronometro = document.getElementById("texto-cuenta-regresiva");
const estadoCombate = document.getElementById("estado-combate");
const controlesCombate = [...document.querySelectorAll("[data-accion-combate]")];

const nombresDeLuchador = {
    leon: ".arena-luchador--leon",
    velocirraptor: ".arena-luchador--raptor",
};

const ajustesDificultad = {
    facil: { dano: 0.75, critico: 0.25, esquive: 0.15 },
    normal: { dano: 1, critico: 0.6, esquive: 0.3 },
    dificil: { dano: 1.2, critico: 1, esquive: 0.45 },
    estrella: { dano: 1.4, critico: 1.2, esquive: 0.6 },
};

const DURACION_PARTIDA = 90;
const PAUSA_ENTRE_TURNOS = 300;

const partida = {
    iniciada: false,
    turnoEnCurso: false,
    esquivaPreparada: false,
    jugador: null,
    maquina: null,
    personajeJugador: null,
    personajeMaquina: null,
    dificultad: "normal",
    tiempoRestante: DURACION_PARTIDA,
    temporizador: null,
};

function escribirTexto(texto) {
    if (mensajeInicial.isConnected) {
        mensajeInicial.remove();
    }

    const mensaje = document.createElement("p");
    mensaje.textContent = texto;
    registroCombate.appendChild(mensaje);
    registroCombate.scrollTop = registroCombate.scrollHeight;
}

function obtenerElementoLuchador(personaje) {
    return document.querySelector(nombresDeLuchador[personaje.id]);
}

function crearPersonaje(id) {
    const base = animalesBase[id];

    return {
        ...base,
        vidaMaxima: base.vida,
    };
}

function actualizarBarraDeVida(personaje, jugador) {
    const sufijo = jugador ? "jugador" : "maquina";
    const barra = document.getElementById(`vida-${sufijo}`);
    const texto = document.getElementById(`texto-vida-${sufijo}`);
    const nombre = document.getElementById(`nombre-${sufijo}`);

    barra.max = personaje.vidaMaxima;
    barra.value = personaje.vida;
    texto.textContent = `${personaje.vida} / ${personaje.vidaMaxima}`;
    nombre.textContent = personaje.nombre;
}

function actualizarEstadoDeVida() {
    actualizarBarraDeVida(partida.jugador, true);
    actualizarBarraDeVida(partida.maquina, false);
}

function actualizarControles() {
    controlesCombate.forEach((boton) => {
        boton.disabled = !partida.iniciada || partida.turnoEnCurso;
    });
}

function detenerCronometro() {
    if (partida.temporizador !== null) {
        clearInterval(partida.temporizador);
        partida.temporizador = null;
    }
}

function finalizarPartida(motivo) {
    if (!partida.iniciada) {
        return;
    }

    partida.iniciada = false;
    partida.turnoEnCurso = false;
    detenerCronometro();
    actualizarControles();

    if (motivo === "tiempo") {
        if (partida.jugador.vida === partida.maquina.vida) {
            estadoCombate.textContent = "¡Empate! Se acabó el tiempo.";
            escribirTexto("La pelea terminó en empate.");
            return;
        }

        const ganador = partida.jugador.vida > partida.maquina.vida
            ? partida.jugador
            : partida.maquina;
        estadoCombate.textContent = `¡${ganador.nombre} gana por tiempo!`;
        escribirTexto(`Se acabó el tiempo. ${ganador.nombre} gana la pelea.`);
        return;
    }

    const ganador = partida.jugador.vida > 0 ? partida.jugador : partida.maquina;
    estadoCombate.textContent = `¡${ganador.nombre} gana!`;
    escribirTexto(`${ganador.nombre} es el ganador.`);
}

function iniciarCronometro() {
    detenerCronometro();
    partida.tiempoRestante = DURACION_PARTIDA;
    cronometro.textContent = "01:30";

    partida.temporizador = setInterval(() => {
        partida.tiempoRestante -= 1;
        const minutos = Math.floor(partida.tiempoRestante / 60);
        const segundos = partida.tiempoRestante % 60;

        cronometro.textContent =
            `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

        if (partida.tiempoRestante <= 0) {
            finalizarPartida("tiempo");
        }
    }, 1000);
}

function reiniciarEstadoVisual() {
    Object.values(nombresDeLuchador).forEach((selector) => {
        const luchador = document.querySelector(selector);

        if (luchador) {
            Animaciones.restablecer(luchador);
        }
    });

    registroCombate.replaceChildren();
    registroCombate.appendChild(mensajeInicial);
    mensajeInicial.textContent = "Todavía no hay movimientos.";
}

function iniciarPartida() {
    detenerCronometro();
    reiniciarEstadoVisual();

    partida.personajeJugador = configuracionJuego.personaje;
    partida.personajeMaquina = partida.personajeJugador === "leon"
        ? "velocirraptor"
        : "leon";
    partida.dificultad = configuracionJuego.dificultad;
    partida.jugador = crearPersonaje(partida.personajeJugador);
    partida.maquina = crearPersonaje(partida.personajeMaquina);
    partida.iniciada = true;
    partida.turnoEnCurso = false;
    partida.esquivaPreparada = false;

    actualizarEstadoDeVida();
    actualizarControles();
    estadoCombate.textContent = "Tu turno. Elige una acción.";
    escribirTexto(`¡Comienza la pelea! Tú controlas al ${partida.jugador.nombre}.`);
    iniciarCronometro();
}

function obtenerDireccion(personaje) {
    return personaje.id === "leon" ? 1 : -1;
}

async function ejecutarAtaque(atacante, defensor, esMaquina = false) {
    const elementoAtacante = obtenerElementoLuchador(atacante);
    const elementoDefensor = obtenerElementoLuchador(defensor);
    const direccion = obtenerDireccion(atacante);
    const animacionAtaque = Animaciones.pelear(elementoAtacante, direccion);
    const esquivaForzada = esMaquina && partida.esquivaPreparada;
    partida.esquivaPreparada = false;

    const ajustes = ajustesDificultad[partida.dificultad];
    const defensorEsMaquina = defensor.id === partida.personajeMaquina;
    const factorEsquive = defensorEsMaquina ? ajustes.esquive : 0.3;
    const probabilidadEsquiva = esquivaForzada
        ? 100
        : defensor.destreza * factorEsquive;

    if (Math.random() * 100 < probabilidadEsquiva) {
        await Promise.all([
            animacionAtaque,
            Animaciones.esquivar(elementoDefensor, -direccion),
        ]);
        escribirTexto(`${defensor.nombre} esquivó el ataque.`);
        return;
    }

    const multiplicadorDano = esMaquina ? ajustes.dano : 1;
    const probabilidadCritico = esMaquina
        ? Math.min(100, atacante.critico * ajustes.critico)
        : atacante.critico;
    const esCritico = Math.random() * 100 < probabilidadCritico;
    let dano = Math.max(
        1,
        Math.round(atacante.dano * multiplicadorDano) - defensor.defensa
    );

    if (esCritico) {
        dano *= 2;
        escribirTexto(`¡Golpe crítico de ${atacante.nombre}!`);
    }

    defensor.vida = Math.max(0, defensor.vida - dano);
    actualizarEstadoDeVida();

    await Promise.all([
        animacionAtaque,
        Animaciones.recibirDanio(elementoDefensor),
    ]);
    escribirTexto(`${atacante.nombre} hizo ${dano} de daño a ${defensor.nombre}.`);

    if (defensor.vida <= 0) {
        await Animaciones.morir(elementoDefensor);
        finalizarPartida("derrota");
    }
}

async function responderComoMaquina() {
    if (!partida.iniciada) {
        return;
    }

    await new Promise((resolver) => setTimeout(resolver, PAUSA_ENTRE_TURNOS));

    if (partida.iniciada) {
        await ejecutarAtaque(partida.maquina, partida.jugador, true);
    }
}

async function ejecutarAccion(accion) {
    if (!partida.iniciada || partida.turnoEnCurso) {
        return;
    }

    partida.turnoEnCurso = true;
    actualizarControles();

    const luchador = obtenerElementoLuchador(partida.jugador);
    const direccion = obtenerDireccion(partida.jugador);

    if (accion === "atacar") {
        await ejecutarAtaque(partida.jugador, partida.maquina);
    } else if (accion === "esquivar") {
        partida.esquivaPreparada = true;
        await Animaciones.esquivar(luchador, -direccion);
        escribirTexto(`${partida.jugador.nombre} se prepara para esquivar.`);
    } else if (accion === "saltar") {
        await Animaciones.saltar(luchador);
        escribirTexto(`${partida.jugador.nombre} saltó.`);
    } else if (accion === "moverAdelante") {
        await Animaciones.moverAdelante(luchador, direccion * 28);
    } else if (accion === "moverAtras") {
        await Animaciones.moverAtras(luchador, direccion * 28);
    }

    if (partida.iniciada) {
        await responderComoMaquina();
    }

    partida.turnoEnCurso = false;
    actualizarControles();

    if (partida.iniciada) {
        estadoCombate.textContent = "Tu turno. Elige una acción.";
    }
}

controlesCombate.forEach((boton) => {
    boton.addEventListener("click", () => {
        ejecutarAccion(boton.dataset.accionCombate);
    });
});

window.addEventListener("keydown", (evento) => {
    if (!partida.iniciada || evento.repeat) {
        return;
    }

    const elementoActivo = evento.target;

    if (
        elementoActivo instanceof HTMLElement &&
        elementoActivo.closest("input, select, textarea, [contenteditable='true']")
    ) {
        return;
    }

    const accionPorTecla = {
        ArrowUp: "saltar",
        ArrowDown: "esquivar",
        Space: "atacar",
    };
    let accion = accionPorTecla[evento.code];

    if (evento.code === "ArrowLeft") {
        accion = partida.jugador.id === "leon" ? "moverAtras" : "moverAdelante";
    } else if (evento.code === "ArrowRight") {
        accion = partida.jugador.id === "leon" ? "moverAdelante" : "moverAtras";
    }

    if (accion) {
        evento.preventDefault();
        ejecutarAccion(accion);
    }
});

window.addEventListener("arena:iniciada", iniciarPartida);
window.addEventListener("arena:finalizada", () => {
    partida.iniciada = false;
    partida.turnoEnCurso = false;
    detenerCronometro();
    actualizarControles();
});
