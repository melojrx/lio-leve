import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Only register SW in production to avoid caching issues during development
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    // In dev, proactively unregister any existing service workers to prevent stale caches
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  }
}

// Animação de revelação para elementos com .reveal-fade-up (fallback sem hook específico)
const setupReveal = () => {
  const els = Array.from(document.querySelectorAll('.reveal-fade-up')) as HTMLElement[];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => observer.observe(el));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupReveal, { once: true });
} else {
  setupReveal();
}

