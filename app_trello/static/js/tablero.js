document.addEventListener('DOMContentLoaded', () => {

    const csrfToken = getCookie('csrftoken');

    // ── AÑADIR TARJETA ──────────────────────────
    document.querySelectorAll('.agregar-tarjeta-wrap').forEach(wrap => {
        const btnAgregar  = wrap.querySelector('.btn-agregar-tarjeta');
        const form        = wrap.querySelector('.form-nueva-tarjeta');
        const btnCancelar = wrap.querySelector('.btn-cancelar');

        btnAgregar.addEventListener('click', () => {
            form.style.display = 'block';
            btnAgregar.style.display = 'none';
            form.querySelector('input').focus();
        });

        btnCancelar.addEventListener('click', () => {
            form.style.display = 'none';
            btnAgregar.style.display = 'block';
            form.querySelector('input').value = '';
        });
    });

    // ── MODAL CONFIRMACIÓN ELIMINAR (lista / tarjeta) ─────────────
    const confirmEl = document.getElementById('modalConfirmEliminar');
    const btnConfirmEliminar = document.getElementById('btnConfirmEliminar');
    const tituloEliminar = document.getElementById('tituloEliminar');
    const textoEliminar  = document.getElementById('textoEliminar');

    let formPendiente = null;

    // Si el modal no existe en este template, no rompemos nada
    const confirmModal = (confirmEl && btnConfirmEliminar) ? new bootstrap.Modal(confirmEl) : null;

    // Interceptar todos los forms marcados con .form-eliminar-confirm
    document.querySelectorAll('.form-eliminar-confirm').forEach(form => {

        // Evitar que el click suba a la tarjeta o a contenedores (importante para click/drag)
        form.addEventListener('click', e => e.stopPropagation());

        // Extra: evita iniciar drag cuando apretas la X
        form.addEventListener('mousedown', e => e.stopPropagation());

        form.addEventListener('submit', e => {
            e.preventDefault();
            e.stopPropagation();

            // Si no hay modal por alguna razón, fallback a confirm nativo (no te deja botado)
            if (!confirmModal) {
                if (confirm('¿Eliminar? Esta acción no se puede deshacer.')) form.submit();
                return;
            }

            formPendiente = form;

            const tipo = form.dataset.tipo || 'elemento';
            const nombre = form.dataset.nombre || '';

            if (tituloEliminar) tituloEliminar.textContent = `Eliminar ${tipo}`;
            if (textoEliminar) {
                textoEliminar.textContent = nombre
                    ? `¿Eliminar ${tipo} "${nombre}"?`
                    : `¿Eliminar este ${tipo}?`;
            }

            confirmModal.show();
        });
    });

    if (confirmEl && btnConfirmEliminar) {
        btnConfirmEliminar.addEventListener('click', () => {
            if (formPendiente) formPendiente.submit();
        });

        confirmEl.addEventListener('hidden.bs.modal', () => {
            formPendiente = null;
        });

        // Evitar propagación dentro del modal
        confirmEl.addEventListener('click', e => e.stopPropagation());
    }

    // ── MODAL DETALLE TARJETA ───────────────────
    const modalEl       = document.getElementById('modalTarjeta');
    const modal         = new bootstrap.Modal(modalEl);
    const modalTitulo   = document.getElementById('modalTitulo');
    const modalDesc     = document.getElementById('modalDescripcion');
    const modalLista    = document.getElementById('modalListaNombre');
    const modalFecha    = document.getElementById('modalCreadoEn');
    const descVista     = document.getElementById('descVista');
    const descEditor    = document.getElementById('descEditor');
    const btnEditarDesc = document.getElementById('btnEditarDesc');
    const btnGuardar    = document.getElementById('btnGuardar');
    const btnCancelarDesc = document.getElementById('btnCancelarDesc');
    const btnEliminar   = document.getElementById('btnEliminarDesdeModal');

    // Evitar que clicks dentro del modal propaguen a la tarjeta
    modalEl.addEventListener('click', e => e.stopPropagation());

    let tarjetaActualUrl = null;
    let tarjetaActualId  = null;

    // Abrir modal al hacer click en tarjeta
    document.querySelectorAll('.tarjeta').forEach(card => {
        card.addEventListener('click', async () => {
            const url = card.dataset.detalleUrl;
            tarjetaActualUrl = card.dataset.editarUrl;
            tarjetaActualId  = card.dataset.tarjetaId;

            const res  = await fetch(url);
            const data = await res.json();

            modalTitulo.value  = data.titulo;
            modalLista.textContent = data.lista;
            modalFecha.textContent = data.creado_en;

            // Descripción
            mostrarDescVista(data.descripcion);
            modalDesc.value = data.descripcion;
            descEditor.style.display = 'none';
            descVista.style.display  = 'block';
            btnEditarDesc.textContent = 'Editar';

            modal.show();
        });
    });

    // Mostrar descripción en vista
    function mostrarDescVista(texto) {
        if (texto && texto.trim()) {
            descVista.textContent = texto;
            descVista.classList.remove('vacia');
        } else {
            descVista.textContent = 'Añade una descripción...';
            descVista.classList.add('vacia');
        }
    }

    // Click en vista de descripción → abrir editor
    descVista.addEventListener('click', () => abrirEditorDesc());

    // Botón Editar
    btnEditarDesc.addEventListener('click', () => {
        if (descEditor.style.display === 'none') {
            abrirEditorDesc();
        }
    });

    function abrirEditorDesc() {
        descVista.style.display  = 'none';
        descEditor.style.display = 'block';
        modalDesc.focus();
        btnEditarDesc.textContent = '';
    }

    // Cancelar edición descripción
    btnCancelarDesc.addEventListener('click', () => {
        descEditor.style.display = 'none';
        descVista.style.display  = 'block';
        btnEditarDesc.textContent = 'Editar';
    });

    // Guardar cambios (título + descripción)
    btnGuardar.addEventListener('click', () => guardar());

    // Guardar con Ctrl+Enter en textarea
    modalDesc.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'Enter') guardar();
    });

    async function guardar() {
        const res = await fetch(tarjetaActualUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                titulo: modalTitulo.value,
                descripcion: modalDesc.value,
            }),
        });

        const data = await res.json();
        if (data.ok) {
            // Actualizar título en la card del tablero
            const card = document.querySelector(`.tarjeta[data-tarjeta-id="${tarjetaActualId}"]`);
            if (card) card.querySelector('.tarjeta-titulo').textContent = data.titulo;

            mostrarDescVista(data.descripcion);
            descEditor.style.display = 'none';
            descVista.style.display  = 'block';
            btnEditarDesc.textContent = 'Editar';
        }
    }

    // Eliminar desde modal (usa el MISMO modal de confirmación bonito)
    btnEliminar.addEventListener('click', () => {
        const card = document.querySelector(`.tarjeta[data-tarjeta-id="${tarjetaActualId}"]`);
        if (!card) return;

        const form = card.querySelector('.form-eliminar-confirm'); // ← importante
        if (!form) return;

        // Cierra el modal de detalle
        modal.hide();

        // Si existe el modal bonito, lo usamos
        if (confirmModal) {
            formPendiente = form;

            const tipo = form.dataset.tipo || 'tarjeta';
            const nombre = form.dataset.nombre || '';

            if (tituloEliminar) tituloEliminar.textContent = `Eliminar ${tipo}`;
            if (textoEliminar) {
                textoEliminar.textContent = nombre
                    ? `¿Eliminar ${tipo} "${nombre}"?`
                    : `¿Eliminar esta ${tipo}?`;
            }

            confirmModal.show();
            return;
        }

        // Fallback
        if (confirm('¿Eliminar esta tarjeta?')) form.submit();
    });

    // ── DRAG & DROP ─────────────────────────────
    let draggedCard = null;

    document.querySelectorAll('.tarjeta').forEach(card => {
        card.addEventListener('dragstart', e => {
            draggedCard = card;
            setTimeout(() => card.classList.add('dragging'), 0);
            e.stopPropagation();
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedCard = null;
            document.querySelectorAll('.tarjetas-container').forEach(c => {
                c.classList.remove('drag-over');
            });
        });
    });

    document.querySelectorAll('.tarjetas-container').forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            if (!draggedCard) return;
            container.classList.add('drag-over');
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(draggedCard);
            } else {
                container.insertBefore(draggedCard, afterElement);
            }
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', e => {
            e.preventDefault();
            container.classList.remove('drag-over');
            if (!draggedCard) return;

            fetch('/tarjeta/mover/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    tarjeta_id: draggedCard.dataset.tarjetaId,
                    lista_destino_id: container.dataset.listaId,
                    orden: [...container.querySelectorAll('.tarjeta')].indexOf(draggedCard),
                }),
            });
        });
    });

    function getDragAfterElement(container, y) {
        const cards = [...container.querySelectorAll('.tarjeta:not(.dragging)')];
        return cards.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function getCookie(name) {
        let value = null;
        document.cookie.split(';').forEach(c => {
            const trimmed = c.trim();
            if (trimmed.startsWith(name + '=')) {
                value = decodeURIComponent(trimmed.substring(name.length + 1));
            }
        });
        return value;
    }

    // ── FONDOS DE TABLERO ─────────────────────
    const tableroRoot = document.getElementById("tableroRoot");
    const modalFondoEl = document.getElementById("modalFondo");

    function aplicarBackground(key) {

        if (!tableroRoot) return;

        tableroRoot.classList.remove(
            "bg-grad-1","bg-grad-2","bg-grad-3",
            "bg-solid-1","bg-solid-2","bg-solid-3"
        );

        if (key) {
            tableroRoot.classList.add(`bg-${key}`);
        }
    }


    // aplicar fondo al cargar la página
    if (tableroRoot) {
        aplicarBackground(tableroRoot.dataset.background || "");
    }


    // click en los botones del modal
    document.querySelectorAll(".bg-opt").forEach(btn => {

        btn.addEventListener("click", async () => {

            const key = btn.dataset.background || "";

            aplicarBackground(key);

            const res = await fetch(`/tablero/${tableroRoot.dataset.tableroId}/fondo/`, {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({
                    background:key
                })
            });

            const data = await res.json();

            if(data.ok){
                tableroRoot.dataset.background = data.background;
            }

            const modal = bootstrap.Modal.getInstance(modalFondoEl);
            if(modal) modal.hide();

        });

    });

});