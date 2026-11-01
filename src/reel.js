// Kisten-Öffnung im Stil von Counter-Strike. Das Ergebnis steht vorher fest und ist
// schon gespeichert, der Streifen zeigt es nur an. So geht beim Abbruch nichts verloren.
import { esc, itemArt } from './art.js';
import { RARITIES, rollItem } from './rules.js';

const CARD_WIDTH = 118;
const CARD_COUNT = 46;
const WINNER_INDEX = 38;
const DURATION = 5600;
const REVEAL_PAUSE = 800;
const FILLER_LUCK = 2;

const rarityName = (item) => RARITIES.find((rarity) => rarity.id === item.rarity).name;

function card(item, winner) {
  return `
    <div class="reel-card ${item.rarity} ${winner ? 'winner' : ''}">
      ${itemArt(item)}
      <span class="reel-name">${esc(item.name)}</span>
      <span class="reel-rarity">${rarityName(item)}</span>
    </div>`;
}

function createAudio() {
  try {
    const context = new AudioContext();
    context.resume();
    const tone = (frequency, length, volume, delay = 0) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + length);
    };
    return {
      tick: () => tone(1700, 0.03, 0.05),
      reveal(tier) {
        const notes = [523, 659, 784, 1047, 1319].slice(0, tier + 2);
        notes.forEach((note, index) => tone(note, 0.35, 0.09, index * 0.09));
      },
      close: () => setTimeout(() => context.close(), 1500),
    };
  } catch {
    return { tick() {}, reveal() {}, close() {} };
  }
}

export function playReel(item, level) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();

  return new Promise((resolve) => {
    const cards = Array.from({ length: CARD_COUNT }, (_, index) => (
      index === WINNER_INDEX ? item : rollItem(level, Math.random, 0, FILLER_LUCK)
    ));
    const overlay = document.createElement('div');
    overlay.className = 'reel-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Kiste wird geöffnet');
    overlay.innerHTML = `
      <p class="system-line">[Kiste wird geöffnet …]</p>
      <div class="reel">
        <div class="reel-track">${cards.map((entry, index) => card(entry, index === WINNER_INDEX)).join('')}</div>
        <i class="reel-marker"></i>
      </div>
      <p class="muted">Tippen zum Überspringen</p>`;
    document.body.append(overlay);

    const track = overlay.querySelector('.reel-track');
    const reel = overlay.querySelector('.reel');
    const audio = createAudio();
    const jitter = (Math.random() - 0.5) * (CARD_WIDTH - 24);
    const target = -(WINNER_INDEX * CARD_WIDTH + CARD_WIDTH / 2 + jitter - reel.clientWidth / 2);

    let finished = false;
    let lastCard = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      track.style.transition = 'none';
      track.style.transform = `translateX(${target}px)`;
      overlay.classList.add('revealed', item.rarity);
      audio.reveal(RARITIES.findIndex((rarity) => rarity.id === item.rarity));
      audio.close();
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, REVEAL_PAUSE);
    };

    const watch = () => {
      if (finished) return;
      const offset = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
      const position = Math.floor(-offset / CARD_WIDTH);
      if (position !== lastCard) {
        lastCard = position;
        audio.tick();
      }
      requestAnimationFrame(watch);
    };

    overlay.addEventListener('click', finish);
    track.addEventListener('transitionend', finish);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      track.style.transition = `transform ${DURATION}ms cubic-bezier(0.1, 0.72, 0.14, 1)`;
      track.style.transform = `translateX(${target}px)`;
      watch();
    }));
  });
}
