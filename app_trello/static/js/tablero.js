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

    // ── ELIMINAR LISTA ──────────────────────────
    document.querySelectorAll('.form-eliminar-lista').forEach(form => {
        form.addEventListener('submit', e => {
            if (!confirm('¿Eliminar esta lista y todas sus tarjetas?')) {
                e.preventDefault();
            }
        });
    });

    // ── ELIMINAR TARJETA (botón X en la card) ───
    document.querySelectorAll('.form-eliminar-tarjeta').forEach(form => {
        form.addEventListener('click', e => e.stopPropagation());
        form.addEventListener('submit', e => {
            e.stopPropagation();
            if (!confirm('¿Eliminar esta tarjeta?')) e.preventDefault();
        });
    });

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

    // Eliminar desde modal
    btnEliminar.addEventListener('click', () => {
        if (!confirm('¿Eliminar esta tarjeta?')) return;
        const card = document.querySelector(`.tarjeta[data-tarjeta-id="${tarjetaActualId}"]`);
        if (card) {
            const form = card.querySelector('.form-eliminar-tarjeta');
            modal.hide();
            form.submit();
        }
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

});