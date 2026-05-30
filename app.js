/**
 * FruitLux — Main JavaScript
 * Handles: loader, navbar, dark mode, scroll reveal, counters,
 *          testimonial slider, gallery lightbox, product filter,
 *          cart drawer, form submission, back-to-top, WhatsApp
 */

/* ─────────────────────────────────────────────────
   1. LOADER
──────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2400);
});


/* ─────────────────────────────────────────────────
   2. NAVBAR — scroll effect + hamburger
──────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  toggleBackToTop();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active link highlight on scroll
const sections = document.querySelectorAll('section[id]');

const observeActive = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => observeActive.observe(s));


/* ─────────────────────────────────────────────────
   3. DARK MODE TOGGLE
──────────────────────────────────────────────────── */
const darkToggle = document.getElementById('darkToggle');
const body       = document.body;
const DARK_KEY   = 'fruitlux-dark';

// Restore saved preference
if (localStorage.getItem(DARK_KEY) === 'true') {
  body.classList.replace('light-mode', 'dark-mode');
  darkToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

darkToggle.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode', !isDark);
  darkToggle.querySelector('i').classList.toggle('fa-sun', isDark);
  darkToggle.querySelector('i').classList.toggle('fa-moon', !isDark);
  localStorage.setItem(DARK_KEY, isDark);
});


/* ─────────────────────────────────────────────────
   4. SCROLL REVEAL
──────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings in a grid
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay    = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────────────
   5. ANIMATED COUNTERS
──────────────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = target / (duration / 16);
  let current    = 0;

  const tick = () => {
    current += step;
    if (current < target) {
      el.textContent = Math.floor(current).toLocaleString();
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString();
    }
  };

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));


/* ─────────────────────────────────────────────────
   6. TESTIMONIAL SLIDER
──────────────────────────────────────────────────── */
(function testiSlider() {
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');
  const cards    = track.querySelectorAll('.testi-card');
  let current    = 0;
  let timer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { timer = setInterval(next, 5000); }
  function stopAuto()  { clearInterval(timer); }

  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  startAuto();
})();


/* ─────────────────────────────────────────────────
   7. GALLERY LIGHTBOX
──────────────────────────────────────────────────── */
(function gallery() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');
  const items    = [...document.querySelectorAll('.g-item')];
  let current    = 0;

  function open(idx) {
    current = idx;
    lbImg.src = items[idx].dataset.src || items[idx].querySelector('img').src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = items[current].dataset.src || items[current].querySelector('img').src;
      lbImg.style.opacity = '1';
    }, 180);
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();


/* ─────────────────────────────────────────────────
   8. PRODUCT FILTER
──────────────────────────────────────────────────── */
(function productFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.transitionDelay = `${(i % 6) * 60}ms`;
        } else {
          card.classList.add('hidden');
          card.style.transitionDelay = '0ms';
        }
      });
    });
  });
})();


/* ─────────────────────────────────────────────────
   9. SHOPPING CART
──────────────────────────────────────────────────── */
const cartState = {
  items: JSON.parse(localStorage.getItem('fruitlux-cart') || '[]')
};

function saveCart() {
  localStorage.setItem('fruitlux-cart', JSON.stringify(cartState.items));
}

function updateCartUI() {
  const cartCount    = document.getElementById('cartCount');
  const cartItems    = document.getElementById('cartItems');
  const cartTotal    = document.getElementById('cartTotal');
  const totalQty     = cartState.items.reduce((acc, i) => acc + i.qty, 0);

  cartCount.textContent = totalQty;
  cartCount.classList.toggle('visible', totalQty > 0);

  if (cartState.items.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your basket is empty 🍃</p>';
    cartTotal.innerHTML = '';
    return;
  }

  cartItems.innerHTML = cartState.items.map(item => `
    <div class="cart-item" data-name="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn qty-minus" data-name="${item.name}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn qty-plus" data-name="${item.name}">+</button>
      </div>
    </div>
  `).join('');

  const total = cartState.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  cartTotal.innerHTML = `<span>Total</span><span>$${total.toFixed(2)}</span>`;

  // Qty controls
  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = cartState.items.find(i => i.name === btn.dataset.name);
      if (item) { item.qty++; saveCart(); updateCartUI(); }
    });
  });

  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = cartState.items.findIndex(i => i.name === btn.dataset.name);
      if (idx !== -1) {
        cartState.items[idx].qty--;
        if (cartState.items[idx].qty <= 0) cartState.items.splice(idx, 1);
        saveCart();
        updateCartUI();
      }
    });
  });
}

// Add to cart buttons
document.addEventListener('click', e => {
  if (!e.target.classList.contains('add-cart')) return;
  const btn   = e.target;
  const name  = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);
  const existing = cartState.items.find(i => i.name === name);

  if (existing) {
    existing.qty++;
  } else {
    cartState.items.push({ name, price, qty: 1 });
  }

  saveCart();
  updateCartUI();

  // Visual feedback
  btn.textContent = '✓ Added!';
  btn.style.background = '#52b788';
  setTimeout(() => {
    btn.textContent = 'Add to Cart';
    btn.style.background = '';
  }, 1500);

  // Pop animation on counter
  const cartCount = document.getElementById('cartCount');
  cartCount.classList.add('pop');
  setTimeout(() => cartCount.classList.remove('pop'), 300);

  openCart();
});

// Cart drawer open/close
const cartBtn      = document.getElementById('cartBtn');
const cartDrawer   = document.getElementById('cartDrawer');
const cartClose    = document.getElementById('cartClose');
const cartBackdrop = document.getElementById('cartBackdrop');

function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cartState.items.length === 0) return;
  alert('🛒 Thank you! This is a demo — integrate your payment gateway here.');
});

// Init cart UI on load
updateCartUI();


/* ─────────────────────────────────────────────────
   10. CONTACT FORM
──────────────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const form    = e.target;
  const success = document.getElementById('formSuccess');
  const btn     = form.querySelector('button[type=submit]');

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  // Simulate async submit
  setTimeout(() => {
    success.classList.add('visible');
    form.reset();
    btn.innerHTML   = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.disabled    = false;
    setTimeout(() => success.classList.remove('visible'), 6000);
  }, 1200);
});


/* ─────────────────────────────────────────────────
   11. NEWSLETTER FORM
──────────────────────────────────────────────────── */
document.getElementById('nlForm').addEventListener('submit', e => {
  e.preventDefault();
  const s = document.getElementById('nlSuccess');
  s.classList.add('visible');
  e.target.reset();
  setTimeout(() => s.classList.remove('visible'), 5000);
});


/* ─────────────────────────────────────────────────
   12. BACK TO TOP
──────────────────────────────────────────────────── */
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ─────────────────────────────────────────────────
   13. SMOOTH SCROLL for anchor links
──────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────────────
   14. LAZY IMAGE loading via Intersection Observer
──────────────────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        img.style.transition = 'opacity 0.4s';
        img.style.opacity    = '0';
        img.onload = () => { img.style.opacity = '1'; };
        lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach(img => lazyObserver.observe(img));
}


/* ─────────────────────────────────────────────────
   15. HERO PARALLAX (subtle)
──────────────────────────────────────────────────── */
const heroImg = document.querySelector('.hero-img');

if (heroImg && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroImg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
  }, { passive: true });
}
