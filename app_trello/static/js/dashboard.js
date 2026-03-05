document.addEventListener('DOMContentLoaded', () => {

 
  document.querySelectorAll('.card[data-url]').forEach(card => {
    card.addEventListener('click', () => {
      window.location = card.dataset.url;
    });
  });

  
  const modalEl = document.getElementById('modalConfirmEliminar');
  const btnConfirm = document.getElementById('btnConfirmEliminar');

  
  if (!modalEl || !btnConfirm) return;

  const modal = new bootstrap.Modal(modalEl);
  let formPendiente = null;

  document.querySelectorAll('.form-eliminar').forEach(form => {

    
    form.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    
    form.addEventListener('submit', (e) => {
      e.preventDefault();     
      e.stopPropagation();

      formPendiente = form;   
      modal.show();          
    });
  });

  // Confirmar eliminación
  btnConfirm.addEventListener('click', () => {
    if (formPendiente) {
      formPendiente.submit();
    }
  });

  // Limpieza al cerrar modal
  modalEl.addEventListener('hidden.bs.modal', () => {
    formPendiente = null;
  });

});