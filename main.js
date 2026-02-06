const body = document.body;
const cursor = document.querySelector('.cursor');
const cursorBlur = document.querySelector('.cursor-blur');
const nav = document.querySelector('.nav');
const themeToggle = document.querySelector('.theme-toggle');
const soundToggle = document.querySelector('.sound-toggle');
const easterEgg = document.querySelector('.easter-egg');

let soundEnabled = false;
let audioContext;
let easterEggTimeout;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setCursorPosition = (x, y) => {
  if (!cursor || !cursorBlur) return;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  cursorBlur.style.transform = `translate(${x - 50}px, ${y - 50}px)`;
};

window.addEventListener('mousemove', (event) => {
  setCursorPosition(event.clientX, event.clientY);
});

window.addEventListener('mouseout', () => {
  cursor?.classList.add('is-hidden');
  cursorBlur?.classList.add('is-hidden');
});

window.addEventListener('mouseover', () => {
  cursor?.classList.remove('is-hidden');
  cursorBlur?.classList.remove('is-hidden');
});

const magnetics = document.querySelectorAll('[data-magnetic]');
magnetics.forEach((element) => {
  element.addEventListener('mousemove', (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'translate(0, 0)';
  });
});

const createAudioContext = () => {
  if (audioContext) return audioContext;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
};

const playTone = (frequency = 440) => {
  if (!soundEnabled) return;
  const context = createAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.08);
};

soundToggle?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  if (soundEnabled) {
    createAudioContext();
    playTone(520);
  }
});

magnetics.forEach((element, index) => {
  element.addEventListener('mouseenter', () => {
    playTone(320 + index * 40);
  });
});

const revealElements = document.querySelectorAll('[data-reveal]');
const splitElements = document.querySelectorAll('[data-split]');

splitElements.forEach((element) => {
  const words = element.textContent.trim().split(' ');
  element.textContent = '';
  element.classList.add('split');
  words.forEach((word) => {
    const span = document.createElement('span');
    span.textContent = `${word} `;
    element.appendChild(span);
  });
});

revealElements.forEach((element) => element.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.2 }
);

[...revealElements, ...splitElements].forEach((element) => observer.observe(element));

const stats = document.querySelectorAll('[data-count]');
const animateCount = (element) => {
  const target = Number(element.dataset.count);
  let value = 0;
  const step = () => {
    value += Math.ceil(target / 60);
    if (value >= target) {
      element.textContent = target;
      return;
    }
    element.textContent = value;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

stats.forEach((stat) => statsObserver.observe(stat));

const parallaxCard = document.querySelector('[data-parallax]');
if (parallaxCard) {
  parallaxCard.addEventListener('mousemove', (event) => {
    const rect = parallaxCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxCard.firstElementChild.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
  });

  parallaxCard.addEventListener('mouseleave', () => {
    parallaxCard.firstElementChild.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

const tiltCards = document.querySelectorAll('[data-tilt]');

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});

let lastScrollY = 0;

const handleScroll = () => {
  const scrollY = window.scrollY;
  nav?.classList.toggle('is-scrolled', scrollY > 40);
  const hero = document.querySelector('.hero__content');
  if (hero && !prefersReducedMotion) {
    hero.style.transform = `translateY(${scrollY * 0.06}px)`;
  }
  lastScrollY = scrollY;
};

window.addEventListener('scroll', handleScroll, { passive: true });

handleScroll();

const activateEasterEgg = () => {
  easterEgg?.classList.add('is-active');
  clearTimeout(easterEggTimeout);
  easterEggTimeout = setTimeout(() => {
    easterEgg?.classList.remove('is-active');
  }, 2600);
};

nav?.addEventListener('dblclick', activateEasterEgg);

let isDark = true;

themeToggle?.addEventListener('click', () => {
  isDark = !isDark;
  body.classList.toggle('theme-light', !isDark);
  body.classList.toggle('theme-dark', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  playTone(isDark ? 420 : 640);
});

const lazyElements = document.querySelectorAll('.gallery__media');
const lazyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-loaded');
        lazyObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

lazyElements.forEach((element) => lazyObserver.observe(element));

if (!prefersReducedMotion) {
  const floating = document.querySelectorAll('.gallery__media');
  floating.forEach((element, index) => {
    element.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: 'translateY(-12px)' },
        { transform: 'translateY(0px)' }
      ],
      {
        duration: 6000 + index * 700,
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );
  });
}
