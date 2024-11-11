document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Open lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const fullUrl = item.dataset.full;
            const caption = item.querySelector('.gallery-caption')?.textContent || '';
            
            lightboxImg.src = fullUrl;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
        });
    });

    // Close lightbox
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });
});