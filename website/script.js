// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
  });
});

// ===== COPY BUTTONS =====
function copyText(btn, text) {
  const doFallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };
  const finish = () => {
    const orig = btn.textContent;
    btn.textContent = '✓ Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(finish).catch(() => { doFallback(); finish(); });
  } else {
    doFallback(); finish();
  }
}

function copyPre(btn) {
  const pre = btn.previousElementSibling;
  const text = pre ? pre.textContent.trim() : '';
  copyText(btn, text);
}

// ===== NAVBAR BURGER =====
function toggleNav() {
  const menu = document.getElementById('navMobileMenu');
  if (menu) menu.classList.toggle('open');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.getElementById('topnav');
  const menu = document.getElementById('navMobileMenu');
  if (nav && menu && !nav.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ===== NAVBAR ACTIVE SECTION HIGHLIGHT =====
const navLinks = document.querySelectorAll('.topnav-links a');
const sections = document.querySelectorAll('section[id]');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
}
