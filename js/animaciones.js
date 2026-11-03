(() => {
    const clasesDeAccion = [
        "animal--adelante",
        "animal--atras",
        "animal--peleando",
        "animal--esquivando",
        "animal--saltando",
        "animal--danado",
        "animal--muriendo",
    ];

    const animacionesActivas = new WeakMap();
    const duraciones = {
        movimiento: 420,
        pelea: 460,
        esquive: 480,
        dano: 420,
        salto: 580,
        muerte: 850,
    };

    function obtenerElemento(animal) {
        const elemento = typeof animal === "string"
            ? document.querySelector(animal)
            : animal;

        if (!(elemento instanceof HTMLElement)) {
            throw new TypeError("Indica un elemento HTML o un selector válido del animal.");
        }

        return elemento;
    }

    function limpiarAnimacion(elemento) {
        const animacionAnterior = animacionesActivas.get(elemento);

        if (!animacionAnterior) {
            return;
        }

        clearTimeout(animacionAnterior.temporizador);
        elemento.removeEventListener("animationend", animacionAnterior.alFinalizar);
        elemento.classList.remove(animacionAnterior.clase);
        animacionesActivas.delete(elemento);
        animacionAnterior.resolver(elemento);
    }

    function animarUnaVez(animal, clase, duracion, desplazamiento = 0) {
        const elemento = obtenerElemento(animal);

        if (elemento.closest(".animal--muerto")) {
            return Promise.resolve(elemento);
        }

        limpiarAnimacion(elemento);
        elemento.classList.remove(...clasesDeAccion);
        elemento.style.setProperty("--animal-desplazamiento", `${desplazamiento}px`);
        void elemento.offsetWidth;
        elemento.classList.add(clase);

        return new Promise((resolve) => {
            const alFinalizar = (evento) => {
                if (evento.target !== elemento) {
                    return;
                }

                limpiarAnimacion(elemento);

                if (clase === "animal--muriendo") {
                    elemento.classList.add("animal--muerto");
                }

                resolve(elemento);
            };

            const temporizador = setTimeout(() => {
                alFinalizar({ target: elemento });
            }, duracion + 100);

            animacionesActivas.set(elemento, {
                alFinalizar,
                clase,
                resolver: resolve,
                temporizador,
            });
            elemento.addEventListener("animationend", alFinalizar);
        });
    }

    function moverAdelante(animal, distancia = 28) {
        return animarUnaVez(animal, "animal--adelante", duraciones.movimiento, distancia);
    }

    function moverAtras(animal, distancia = 28) {
        return animarUnaVez(animal, "animal--atras", duraciones.movimiento, -distancia);
    }

    function pelear(animal, direccion = 1) {
        return animarUnaVez(animal, "animal--peleando", duraciones.pelea, direccion * 34);
    }

    function esquivar(animal, direccion = -1) {
        return animarUnaVez(animal, "animal--esquivando", duraciones.esquive, direccion * 24);
    }

    function recibirDanio(animal) {
        const elemento = obtenerElemento(animal);
        const avatar = elemento.matches(".avatar-personaje")
            ? elemento
            : elemento.querySelector(".avatar-personaje") || elemento;

        return animarUnaVez(avatar, "animal--danado", duraciones.dano);
    }

    function saltar(animal) {
        return animarUnaVez(animal, "animal--saltando", duraciones.salto);
    }

    function morir(animal) {
        return animarUnaVez(animal, "animal--muriendo", duraciones.muerte);
    }

    function restablecer(animal) {
        const elemento = obtenerElemento(animal);
        const partesAnimadas = [
            elemento,
            ...elemento.querySelectorAll(".avatar-personaje"),
        ];

        partesAnimadas.forEach((parte) => {
            limpiarAnimacion(parte);
            parte.classList.remove(...clasesDeAccion, "animal--muerto");
            parte.style.removeProperty("--animal-desplazamiento");
        });

        return elemento;
    }

    window.Animaciones = Object.freeze({
        moverAdelante,
        moverAtras,
        pelear,
        esquivar,
        recibirDanio,
        morir,
        saltar,
        restablecer,
    });
})();