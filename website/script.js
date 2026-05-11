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
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Kopieren'; btn.classList.remove('copied'); }, 2000);
  });
}

function copyPre(btn) {
  const pre = btn.previousElementSibling;
  const text = pre.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Kopieren'; btn.classList.remove('copied'); }, 2000);
  });
}

// ===== PASSWORD TOGGLE =====
function togglePw() {
  const input = document.getElementById('demo-pw');
  const showIcon = document.getElementById('pw-eye-show');
  const hideIcon = document.getElementById('pw-eye-hide');
  if (input && input.type === 'password') {
    input.type = 'text';
    if (showIcon) showIcon.style.display = 'none';
    if (hideIcon) hideIcon.style.display = 'block';
  } else if (input) {
    input.type = 'password';
    if (showIcon) showIcon.style.display = 'block';
    if (hideIcon) hideIcon.style.display = 'none';
  }
}

// ===== DEMO FORM SUBMIT =====
function handleDemoSubmit(e) {
  e.preventDefault();
  const school = document.getElementById('demo-school');
  const user   = document.getElementById('demo-user');
  const pw     = document.getElementById('demo-pw');
  const cls    = document.getElementById('demo-class');
  const msg    = document.getElementById('demo-msg');
  if (!school || !user || !pw || !cls || !msg) return;

  [school, user, pw, cls].forEach(f => f.classList.remove('ha-error'));
  msg.style.display = 'none';

  let valid = true;
  if (!school.value.trim()) { school.classList.add('ha-error'); valid = false; }
  if (!user.value.trim())   { user.classList.add('ha-error');   valid = false; }
  if (!pw.value.trim())     { pw.classList.add('ha-error');     valid = false; }
  if (!cls.value.trim())    { cls.classList.add('ha-error');    valid = false; }

  if (!valid) {
    msg.className = 'ha-demo-msg error';
    msg.textContent = '⚠️ Bitte alle Pflichtfelder ausfüllen.';
    msg.style.display = 'block';
    return;
  }

  msg.className = 'ha-demo-msg success';
  msg.textContent = '✅ Demo erfolgreich! In Home Assistant würde die Integration jetzt eingerichtet werden.';
  msg.style.display = 'block';

  setTimeout(() => {
    msg.style.display = 'none';
    [school, user, pw, cls].forEach(f => f.value = '');
  }, 3500);
}

function resetDemo() {
  const msg = document.getElementById('demo-msg');
  if (msg) msg.style.display = 'none';
  ['demo-school','demo-user','demo-pw','demo-class'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('ha-error'); }
  });
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
