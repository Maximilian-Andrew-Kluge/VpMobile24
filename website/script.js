// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
  });
});

// ===== COPY BUTTONS =====
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Kopieren';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function copyPre(btn) {
  const pre = btn.previousElementSibling;
  const text = pre.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Kopieren';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ===== SMOOTH SCROLL for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
