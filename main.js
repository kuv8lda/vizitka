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

      const opacity = Math.max(0, 1 - Math.abs(distance) * 1.5);

      const offset = -distance * 40;

      frame.style.opacity = opacity.toFixed(3);
      frame.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      frame.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      frame.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;

      if (active !== currentFrame) {
        frame.inert = index !== active;
        frame.setAttribute('aria-hidden', String(index !== active));
      }
    });
    currentFrame = active;
    frameNumber.textContent = String(active + 1).padStart(2, '0');
    progressBar.style.transform = `scaleX(${Math.max(.02, progress)})`;
    updateSound(progress);
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
      else stopSound();
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

  const soundButton = document.querySelector('.sound');
  const soundLabel = document.querySelector('[data-sound-label]');
  let audio = null;
  let gain = null;
  let soundOn = false;
  let soundBusy = false;
  function updateSound(progress) {
    if (audio && gain && soundOn) {
      gain.gain.setTargetAtTime(.018 + Math.sin(progress * Math.PI) * .012, audio.currentTime, .4);
    }
  }
  function stopSound() {
    if (!audio || !soundOn) return;
    soundOn = false;
    audio.suspend().catch(() => {});
    setSoundLabel();
  }
  function setSoundLabel() {
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Выключить фоновый звук' : 'Включить фоновый звук');
    soundLabel.textContent = soundOn ? 'вкл.' : 'выкл.';
  }
  soundButton.addEventListener('click', async () => {
    if (soundBusy) return;
    soundBusy = true;
    try {
      if (!audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error('Web Audio недоступен');
        audio = new AudioContext();
        gain = audio.createGain();
        gain.gain.value = 0;
        gain.connect(audio.destination);
        [110, 164.81, 220.3].forEach(frequency => {
          const oscillator = audio.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          const voice = audio.createGain();
          voice.gain.value = .2;
          oscillator.connect(voice).connect(gain);
          oscillator.start();
        });
      }
      if (soundOn) {
        await audio.suspend();
        soundOn = false;
      } else {
        await audio.resume();
        soundOn = true;
        gain.gain.setTargetAtTime(.022, audio.currentTime, .8);
        if (document.hidden) { await audio.suspend(); soundOn = false; }
      }
      setSoundLabel();
    } catch (error) {
      soundOn = false;
      setSoundLabel();
      soundLabel.textContent = 'недоступен';
      soundButton.disabled = true;
      console.warn('Фоновый звук недоступен:', error);
    } finally { soundBusy = false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetMagnetic();
      stopSound();
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
