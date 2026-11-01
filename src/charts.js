// Liniendiagramm ohne Bibliothek, damit es auch im Gym offline funktioniert.
const WIDTH = 340;
const HEIGHT = 180;
const MARGIN = { top: 14, right: 14, bottom: 24, left: 38 };

const shortDate = (value) => new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
const format = (value) => Number(value).toLocaleString('de-DE', { maximumFractionDigits: 1 });

function niceTicks(min, max) {
  const span = max - min || Math.max(1, Math.abs(max) * 0.1);
  const raw = span / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw);
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let tick = start; tick <= max + step * 0.999; tick += step) ticks.push(Math.round(tick * 100) / 100);
  return ticks;
}

export function lineChart(points, { unit, label }) {
  const times = points.map((point) => new Date(point.date).getTime());
  const minTime = Math.min(...times);
  const span = Math.max(...times) - minTime;
  const values = points.map((point) => point.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const low = ticks[0];
  const high = ticks[ticks.length - 1];

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (time) => MARGIN.left + (span ? ((time - minTime) / span) * innerWidth : innerWidth / 2);
  const y = (value) => MARGIN.top + innerHeight - ((value - low) / (high - low)) * innerHeight;
  const coords = points.map((point, index) => ({
    x: Math.round(x(times[index]) * 10) / 10,
    y: Math.round(y(point.value) * 10) / 10,
    text: `${shortDate(point.date)}: ${format(point.value)} ${unit}`,
  }));

  const grid = ticks.map((tick) => `
    <line class="chart-grid" x1="${MARGIN.left}" x2="${WIDTH - MARGIN.right}" y1="${y(tick)}" y2="${y(tick)}"></line>
    <text class="chart-axis" x="${MARGIN.left - 6}" y="${y(tick) + 4}" text-anchor="end">${format(tick)}</text>`).join('');
  const line = coords.map((coord, index) => `${index ? 'L' : 'M'}${coord.x} ${coord.y}`).join(' ');
  const dots = coords.length <= 24
    ? coords.map((coord) => `<circle class="chart-dot" cx="${coord.x}" cy="${coord.y}" r="4"></circle>`).join('')
    : `<circle class="chart-dot" cx="${coords.at(-1).x}" cy="${coords.at(-1).y}" r="4"></circle>`;
  const dates = coords.length > 1
    ? `<text class="chart-axis" x="${MARGIN.left}" y="${HEIGHT - 6}">${shortDate(points[0].date)}</text>
       <text class="chart-axis" x="${WIDTH - MARGIN.right}" y="${HEIGHT - 6}" text-anchor="end">${shortDate(points.at(-1).date)}</text>`
    : `<text class="chart-axis" x="${coords[0].x}" y="${HEIGHT - 6}" text-anchor="middle">${shortDate(points[0].date)}</text>`;

  const latest = coords.at(-1);
  return `
    <div class="chart" data-points='${JSON.stringify(coords).replace(/'/g, '&#39;')}'>
      <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${label}: letzter Wert ${latest.text}">
        ${grid}
        ${dates}
        ${coords.length > 1 ? `<path class="chart-line" d="${line}"></path>` : ''}
        ${dots}
        <line class="chart-cross" y1="${MARGIN.top}" y2="${HEIGHT - MARGIN.bottom}" hidden></line>
        <circle class="chart-focus" r="6" hidden></circle>
      </svg>
      <p class="chart-tip" hidden></p>
    </div>`;
}

// Fingerbewegung zeigt den nächsten Messpunkt. Das läuft direkt am DOM,
// damit beim Ziehen kein neues Rendern den Finger unterbricht.
export function attachChartHover(root) {
  const track = (event) => {
    const chart = event.target.closest?.('.chart');
    if (!chart) return;
    const points = JSON.parse(chart.dataset.points);
    const box = chart.querySelector('svg').getBoundingClientRect();
    const pointer = ((event.clientX - box.left) / box.width) * WIDTH;
    const nearest = points.reduce((best, point) => (
      Math.abs(point.x - pointer) < Math.abs(best.x - pointer) ? point : best
    ));

    const cross = chart.querySelector('.chart-cross');
    const focus = chart.querySelector('.chart-focus');
    const tip = chart.querySelector('.chart-tip');
    cross.setAttribute('x1', nearest.x);
    cross.setAttribute('x2', nearest.x);
    focus.setAttribute('cx', nearest.x);
    focus.setAttribute('cy', nearest.y);
    tip.textContent = nearest.text;
    tip.style.left = `${(nearest.x / WIDTH) * 100}%`;
    tip.style.top = `${(nearest.y / HEIGHT) * 100}%`;
    tip.classList.toggle('flip', nearest.x > WIDTH * 0.6);
    tip.classList.toggle('flop', nearest.x < WIDTH * 0.4);
    cross.removeAttribute('hidden');
    focus.removeAttribute('hidden');
    tip.hidden = false;
  };
  root.addEventListener('pointerdown', track);
  root.addEventListener('pointermove', track);
}
