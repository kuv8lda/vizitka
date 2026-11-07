'use strict';

(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.querySelector('video');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const shortViewport = matchMedia('(max-height: 600px), (max-width: 600px) and (max-height: 700px)');
  const staticScene = () => reduced.matches || shortViewport.matches;
  const film = document.querySelector('.film');
  const screen = document.querySelector('.screen');
  const frames = [...document.querySelectorAll('[data-frame]')];
  const progressBar = document.querySelector('#film-progress');
  const frameNumber = document.querySelector('#frame-number');
  const magnetic = [...document.querySelectorAll('[data-magnetic]')];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let filmTop = 0;
  let filmTravel = 1;
  let sceneVisible = true;
  let sceneRequest = 0;
  let currentFrame = -1;

  root.classList.add('js');

  function measure() {
    filmTop = film.getBoundingClientRect().top + scrollY;
    filmTravel = Math.max(1, film.offsetHeight - screen.offsetHeight);
    scheduleScene();
  }

  function renderScene() {
    sceneRequest = 0;
    if (staticScene()) return;
    const progress = clamp((scrollY - filmTop) / filmTravel);
    const position = progress * (frames.length - 1);
    const active = Math.round(position);
    frames.forEach((frame, index) => {
      const distance = position - index;

      const isActive = index === active;
      const opacity = isActive ? 1 - Math.abs(distance) : 0;
      const offset = -distance * 40;

      frame.classList.toggle('is-active', isActive);
      frame.style.opacity = opacity.toFixed(3);
      frame.style.visibility = isActive ? 'visible' : 'hidden';
      frame.style.pointerEvents = isActive ? 'auto' : 'none';
      frame.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;

      if (active !== currentFrame) {
        frame.inert = index !== active;
        frame.setAttribute('aria-hidden', String(index !== active));
      }
    });
    currentFrame = active;
    frameNumber.textContent = String(active + 1).padStart(2, '0');
    progressBar.style.transform = `scaleX(${Math.max(.02, progress)})`;
  }

  function scheduleScene() {
    if (!sceneRequest && sceneVisible && !staticScene()) {
      sceneRequest = requestAnimationFrame(renderScene);
    }
  }
  addEventListener('scroll', scheduleScene, { passive: true });
  addEventListener('resize', measure, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      sceneVisible = entry.isIntersecting;
      if (sceneVisible) scheduleScene();
    }).observe(film);
  }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(screen);

  let magnet = null;
  let magnetRect = null;

  function resetMagnetic() {
    magnetic.forEach(element => { element.style.transform = ''; });
    magnet = null;
    magnetRect = null;
  }

  magnetic.forEach(element => {
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || reduced.matches || !finePointer.matches) return;
      magnet = element;
      magnetRect = element.getBoundingClientRect();
    });
    element.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reduced.matches || !finePointer.matches || magnet !== element || !magnetRect) return;
      const centerX = magnetRect.left + magnetRect.width / 2;
      const centerY = magnetRect.top + magnetRect.height / 2;
      const dx = clamp((event.clientX - centerX) * .18, -4, 4);
      const dy = clamp((event.clientY - centerY) * .18, -3, 3);
      element.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    }, { passive: true });
    element.addEventListener('pointerleave', resetMagnetic);
  });
  root.addEventListener('pointerleave', resetMagnetic);
  addEventListener('blur', resetMagnetic);
  // Cached bounds would be stale after scroll; release the magnetic target.
  addEventListener('scroll', resetMagnetic, { passive: true });
  finePointer.addEventListener('change', resetMagnetic);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetMagnetic();
    }
  });

  function motionPreference() {
    if (video) {
      video.autoplay = !reduced.matches;
      if (reduced.matches) video.pause();
    }
    root.classList.toggle('reduced-motion', reduced.matches);
    root.classList.toggle('static-scene', staticScene());
    resetMagnetic();
    currentFrame = -1;
    if (staticScene()) {
      cancelAnimationFrame(sceneRequest);
      sceneRequest = 0;
      frames.forEach(frame => {
        frame.removeAttribute('style');
        frame.inert = false;
        frame.removeAttribute('aria-hidden');
      });
    }
    requestAnimationFrame(measure);
  }
  reduced.addEventListener('change', motionPreference);
  shortViewport.addEventListener('change', motionPreference);
  motionPreference();
})();


// Aurora has a single five-second budget; time outside the scene does not count.
(() => {
  const aurora = document.querySelector('.scene-aurora');
  if (!aurora || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const forced = matchMedia('(forced-colors: active)');
  let auroraVisible = false;
  let auroraRemaining = 5000;
  let auroraStarted = 0;
  let auroraTimer = 0;

  function pauseAurora() {
    if (!auroraTimer) return;
    clearTimeout(auroraTimer);
    auroraTimer = 0;
    auroraRemaining = Math.max(0, auroraRemaining - (performance.now() - auroraStarted));
    aurora.classList.remove('is-running');
  }
  function updateAurora() {
    if (!auroraVisible || document.hidden || reduced.matches || mobile.matches || forced.matches) {
      pauseAurora();
      return;
    }
    if (auroraTimer || auroraRemaining <= 0) return;
    auroraStarted = performance.now();
    aurora.classList.add('is-running');
    auroraTimer = setTimeout(() => {
      auroraRemaining = 0;
      auroraTimer = 0;
      aurora.classList.remove('is-running');
    }, auroraRemaining);
  }
  new IntersectionObserver(([entry]) => {
    auroraVisible = entry.isIntersecting;
    updateAurora();
  }).observe(document.querySelector('.screen'));
  [reduced, mobile, forced].forEach(query => query.addEventListener('change', updateAurora));
  document.addEventListener('visibilitychange', updateAurora);
})();
