document.addEventListener('DOMContentLoaded', () => {

    // Navegar al tablero al hacer click en la card
    document.querySelectorAll('.card[data-url]').forEach(card => {
        card.addEventListener('click', () => {
            window.location = card.dataset.url;
        });
    });

    // Evitar que el click en el botón Eliminar navegue al tablero
    document.querySelectorAll('.form-eliminar').forEach(form => {
        form.addEventListener('click', e => {
            e.stopPropagation();
        });

        form.addEventListener('submit', e => {
            e.stopPropagation();
            if (!confirm('¿Eliminar este tablero? Esta acción no se puede deshacer.')) {
                e.preventDefault();
            }
        });
    });

});