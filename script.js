// ──────────────────────────────────────────────────
//  GenZyra — script.js
//  Firebase Firestore contact form + UI interactions
// ──────────────────────────────────────────────────

// ── Firebase config (CDN compat) ──────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyDo-4pAKhQJfijW9r53_pxyroEjygyxYeo",
    authDomain:        "genzyra-ef740.firebaseapp.com",
    projectId:         "genzyra-ef740",
    storageBucket:     "genzyra-ef740.firebasestorage.app",
    messagingSenderId: "412063629189",
    appId:             "1:412063629189:web:ec73b025f98167e8170eec",
    measurementId:     "G-PDJHZG17L2"
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

// ── Everything that needs the DOM ─────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // ── Mobile menu ──
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks   = document.querySelector('.nav-links');
    const menuIcon   = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuIcon.className = navLinks.classList.contains('active') ? 'bx bx-x' : 'bx bx-menu';
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuIcon.className = 'bx bx-menu';
        });
    });

    // ── Navbar shrink on scroll ──
    window.addEventListener('scroll', () => {
        document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Scroll-triggered fade-in animations ──
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in-up, .fade-in, .pop-in').forEach(el => observer.observe(el));

    // ── Portfolio modal ───────────────────────────
    const modal      = document.getElementById('portfolioModal');
    const modalImg   = document.getElementById('modalImg');
    const modalTag   = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc  = document.getElementById('modalDesc');
    const modalTech  = document.getElementById('modalTech');
    const modalClose = document.getElementById('modalClose');

    if (modal) {
        // Open modal on card click
        document.querySelectorAll('.portfolio-card').forEach(card => {
            card.addEventListener('click', () => {
                modalImg.src      = card.dataset.img   || '';
                modalImg.alt      = card.dataset.title || '';
                modalTag.textContent   = card.dataset.tag   || '';
                modalTitle.textContent = card.dataset.title || '';
                modalDesc.textContent  = card.dataset.desc  || '';

                // Build tech pills
                modalTech.innerHTML = (card.dataset.tech || '').split(',').map(t =>
                    '<span>' + t.trim() + '</span>'
                ).join('');

                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
            });
        });

        // Close on X button
        modalClose.addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

        // Close on Escape key
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        }
    }


    // ── Contact form → Firestore ──────────────────
    const form      = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const toast     = document.getElementById('formToast');

    function showToast(msg, type) {
        toast.textContent = msg;
        toast.className   = 'form-toast ' + type;
        setTimeout(() => { toast.className = 'form-toast hidden'; }, 5000);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name    = document.getElementById('c-name').value.trim();
        const email   = document.getElementById('c-email').value.trim();
        const message = document.getElementById('c-message').value.trim();

        if (!name || !email || !message) {
            showToast('Please fill in all fields.', 'error');
            return;
        }

        submitBtn.disabled  = true;
        submitBtn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';

        try {
            await db.collection('messages').add({
                name:      name,
                email:     email,
                message:   message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            showToast("Message sent! We'll get back to you soon.", 'success');
            form.reset();
        } catch (err) {
            console.error('Firestore error:', err);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = 'Send Message <i class="bx bx-send"></i>';
        }
    });

}); // end DOMContentLoaded
