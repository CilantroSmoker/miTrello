document.addEventListener('DOMContentLoaded', () => {

    // Abrir modal avatar
    const avatarWrap = document.getElementById('avatarWrap');
    const modalAvatarEl = document.getElementById('modalAvatar');
    if (avatarWrap && modalAvatarEl) {
        const modalAvatar = new bootstrap.Modal(modalAvatarEl);
        avatarWrap.addEventListener('click', () => modalAvatar.show());
    }

    // Abrir modal portada
    const bannerWrap = document.getElementById('bannerWrap');
    const modalPortadaEl = document.getElementById('modalPortada');
    if (bannerWrap && modalPortadaEl) {
        const modalPortada = new bootstrap.Modal(modalPortadaEl);
        bannerWrap.addEventListener('click', () => modalPortada.show());
    }

    // Asignar backgrounds a las opciones de portada
    document.querySelectorAll('.portada-img').forEach(btn => {
        btn.style.backgroundImage = `url('${btn.dataset.bg}')`;
        btn.style.backgroundSize = 'cover';
        btn.style.backgroundPosition = 'center';
    });

});