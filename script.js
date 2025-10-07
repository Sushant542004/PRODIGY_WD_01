// final script.js — robust modal + submit handling
document.addEventListener('DOMContentLoaded', () => {
  // Navbar color on scroll
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Active nav link highlight
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Fade-in animation for sections
  const fadeElements = document.querySelectorAll(".fade-in");
  function reveal() {
    const trigger = window.innerHeight * 0.85;
    fadeElements.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < trigger) el.classList.add("visible");
    });
  }
  window.addEventListener("scroll", reveal);
  window.addEventListener("load", reveal);
  reveal();

  // Modal & form handling
  const successModal = document.getElementById('successModal');
  const errorModal = document.getElementById('errorModal');
  const form = document.querySelector('.contact-form');
  let autoCloseTimer = null;

  // Utility: show/hide modal
  function showModal(modal) {
    if (!modal) return;
    clearTimeout(autoCloseTimer);
    modal.style.display = 'flex';
    // force reflow to ensure transition
    void modal.offsetWidth;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // auto-close after 3 seconds
    autoCloseTimer = setTimeout(() => hideModal(modal), 3000);
  }

  function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    clearTimeout(autoCloseTimer);
    // wait for transition then hide
    setTimeout(() => {
      modal.style.display = 'none';
    }, 420);
  }

  // Attach close handlers once
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      hideModal(modal);
    });
  });

  // close on outside click
  window.addEventListener('click', (event) => {
    if (event.target.classList && event.target.classList.contains('modal')) {
      hideModal(event.target);
    }
  });

  // close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal(successModal);
      hideModal(errorModal);
    }
  });

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // simple guard
      if (!form.checkValidity()) {
        // Let browser show validation UI
        form.reportValidity();
        return;
      }

      // disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.origText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        console.log('Form submit response:', response);

        if (response.ok) {
          // success
          showModal(successModal);
          form.reset();
        } else {
          // Try to parse message from response body (if any)
          let msg = 'Failed to send message. Please try again.';
          try {
            const data = await response.json();
            if (data && data.message) msg = data.message;
          } catch (err) {
            // ignore parse errors
          }
          const p = errorModal.querySelector('.modal-body p');
          if (p) p.textContent = '❌ ' + msg;
          showModal(errorModal);
        }
      } catch (err) {
        console.error('Error sending form:', err);
        const p = errorModal.querySelector('.modal-body p');
        if (p) p.textContent = '❌ Network error: could not send message.';
        showModal(errorModal);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.origText || 'Send Message';
        }
      }
    });
  } else {
    console.warn('No form element (.contact-form) found on page.');
  }
});
