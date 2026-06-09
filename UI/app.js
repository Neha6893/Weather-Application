/* =========================================================
   Weather App — app.js
   Consumes: GET /weather/forcast?city=CITY&day=N
   ========================================================= */

const API_BASE   = 'http://localhost:8080/weather/forcast';
const DEFAULT_CITY =null;
const DEFAULT_DAYS = null;

let isCelsius = true;
let currentData = null;

/* ── Condition → icon mapping ──────────────────────────── */
const conditionIcon = (cond = '') => {
  const c = cond.toLowerCase();
  if (c.includes('thunder') || c.includes('storm'))  return 'icons/thunderstorm.svg';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'icons/rain.svg';
  if (c.includes('cloud') && (c.includes('partly') || c.includes('mostly'))) return 'icons/partly-cloudy.svg';
  if (c.includes('cloud') || c.includes('overcast')) return 'icons/cloudy.svg';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze'))        return 'icons/mist.svg';
  return 'icons/clear.svg'; // sunny / clear
};

/* ── Temperature conversion ────────────────────────────── */
const toDisplay = (c) => isCelsius ? c : (c * 9/5 + 32);
const fmtTemp   = (c) => `${toDisplay(c).toFixed(1)}°`;
const unit      = ()  => isCelsius ? '°C' : '°F';

/* ── Helpers ───────────────────────────────────────────── */
const el = (id) => document.getElementById(id);

const dayLabel = (dateStr, idx) => {
  if (idx === 0) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
};

/* ── Gradient bar for forecast temps ───────────────────── */
const buildBarGradient = (allDays) => {
  const allMax = allDays.map(d => d.maxTemp);
  const allMin = allDays.map(d => d.minTemp);
  const gMin   = Math.min(...allMin);
  const gMax   = Math.max(...allMax);
  const range  = gMax - gMin || 1;

  return allDays.map(d => {
    const left  = ((d.minTemp - gMin) / range) * 100;
    const width = ((d.maxTemp - d.minTemp) / range) * 100;
    const pct   = (d.avgTemp - gMin) / range;
    // colour from cool-blue → warm-orange
    const r = Math.round(96  + pct * (249 - 96));
    const g = Math.round(165 + pct * (115 - 165));
    const b = Math.round(250 + pct * (22  - 250));
    return { left: `${left}%`, width: `${width}%`, color: `rgb(${r},${g},${b})` };
  });
};

/* ── SVG area chart for avg temperatures ───────────────── */
const drawChart = (days) => {
  const svg    = el('tempChart');
  const W      = svg.clientWidth  || 600;
  const H      = svg.clientHeight || 130;
  const pad    = { t: 24, r: 20, b: 28, l: 20 };
  const vals   = days.map(d => toDisplay(d.avgTemp));
  const minV   = Math.min(...vals) - 1;
  const maxV   = Math.max(...vals) + 1;
  const xStep  = (W - pad.l - pad.r) / (days.length - 1);
  const yScale = (v) => pad.t + (1 - (v - minV) / (maxV - minV)) * (H - pad.t - pad.b);

  const pts = vals.map((v, i) => [pad.l + i * xStep, yScale(v)]);

  // smooth curve
  const curve = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p[0]},${p[1]}`;
    const prev = pts[i - 1];
    const cpx  = (prev[0] + p[0]) / 2;
    return acc + ` C ${cpx},${prev[1]} ${cpx},${p[1]} ${p[0]},${p[1]}`;
  }, '');

  // area path (close at bottom)
  const area = curve + ` L ${pts[pts.length-1][0]},${H - pad.b} L ${pts[0][0]},${H - pad.b} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#f97316" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.04"/>
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="#f97316"/>
      </linearGradient>
    </defs>
    <!-- Area fill -->
    <path d="${area}" fill="url(#areaGrad)"/>
    <!-- Line -->
    <path d="${curve}" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Dots + labels -->
    ${pts.map((p, i) => `
      <circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#0f2a5c" stroke="url(#lineGrad)" stroke-width="2.5"/>
      <text x="${p[0]}" y="${p[1] - 10}" text-anchor="middle"
            font-size="11" font-weight="600" fill="rgba(255,255,255,0.85)"
            font-family="DM Sans, sans-serif">
        ${vals[i].toFixed(1)}°
      </text>
    `).join('')}
    <!-- X-axis labels -->
    ${days.map((d, i) => `
      <text x="${pts[i][0]}" y="${H - 6}" text-anchor="middle"
            font-size="10" fill="rgba(255,255,255,0.5)"
            font-family="DM Sans, sans-serif">
        ${i === 0 ? 'Today' : new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', {weekday:'short'})}
      </text>
    `).join('')}
  `;
};

/* ── Render weather data ───────────────────────────────── */
const render = (data) => {
  const w   = data.weatherResponse;
  const days = data.day;
  const bars = buildBarGradient(days);

  // ── Hero card
  el('heroCard').innerHTML = `
    <div class="hero-top">
      <div class="location-info">
        <h1>${w.cityname}, ${w.region}</h1>
        <p>${w.contry} &nbsp;·&nbsp; Updated just now</p>
      </div>
      <div class="unit-toggle">
        <button id="btnC" class="${isCelsius ? 'active' : ''}" onclick="setUnit(true)">°C</button>
        <button id="btnF" class="${!isCelsius ? 'active' : ''}" onclick="setUnit(false)">°F</button>
      </div>
    </div>

    <div class="hero-main">
      <div class="hero-icon">
        <img src="${conditionIcon(w.condition)}" alt="${w.condition}"/>
      </div>
      <div class="hero-temps">
        <div class="current-temp" id="curTemp">${fmtTemp(w.temp)}<span style="font-size:36px;letter-spacing:-1px">${unit()}</span></div>
        <div class="condition-label">${w.condition}</div>
        <div class="hi-lo">
          <span class="hi">H ${fmtTemp(days[0].maxTemp)}${unit()}</span>
          <span class="lo">L ${fmtTemp(days[0].minTemp)}${unit()}</span>
        </div>
      </div>
    </div>

    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-label">7-Day Avg</span>
        <span class="stat-value">${fmtTemp(days.reduce((s,d)=>s+d.avgTemp,0)/days.length)}${unit()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak High</span>
        <span class="stat-value" style="color:#f97316">${fmtTemp(Math.max(...days.map(d=>d.maxTemp)))}${unit()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Lowest Low</span>
        <span class="stat-value" style="color:#93c5fd">${fmtTemp(Math.min(...days.map(d=>d.minTemp)))}${unit()}</span>
      </div>
    </div>
  `;

  // ── 7-day rows
  el('forecastRows').innerHTML = days.map((d, i) => `
    <div class="forecast-row ${i === 0 ? 'today' : ''}">
      <div class="day-name">${dayLabel(d.date, i)}</div>
      <img class="forecast-icon" src="${conditionIcon(i < 2 ? w.condition : '')}" alt=""/>
      <div class="temp-bar-wrap">
        <span class="temp-min">${fmtTemp(d.minTemp)}</span>
        <div class="bar-track">
          <div class="bar-fill" style="left:${bars[i].left};width:${bars[i].width};background:${bars[i].color}"></div>
        </div>
        <span class="temp-max">${fmtTemp(d.maxTemp)}</span>
      </div>
    </div>
  `).join('');

  // ── Chart
  drawChart(days);
};

/* ── Show loading / error states ──────────────────────── */
const showLoading = () => {
  el('heroCard').innerHTML = `
    <div class="state-message">
      <div class="state-icon">🌤</div>
      <h2>Fetching weather…</h2>
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>`;
  el('forecastRows').innerHTML = '';
  el('tempChart').innerHTML = '';
};

const showError = (msg) => {
  el('heroCard').innerHTML = `
    <div class="state-message">
      <div class="state-icon">⚠️</div>
      <h2>Couldn't load data</h2>
      <p>${msg}</p>
    </div>`;
};

/* ── Fetch from API ────────────────────────────────────── */
const fetchWeather = async (city, days) => {
  showLoading();
  try {
    const url  = `${API_BASE}?city=${encodeURIComponent(city)}&day=${days}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    currentData = await res.json();
    render(currentData);
  } catch (err) {
    console.error(err);
    // For demo/dev: use mock data if API unreachable
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      loadMock();
    } else {
      showError(err.message);
    }
  }
};

/* ── Mock data (offline fallback) ──────────────────────── */
// const loadMock = () => {
//   currentData = {
//     weatherResponse: {
//       cityname: "Nandurbar", region: "Maharashtra",
//       contry: "India", temp: 34.1, condition: "Clear"
//     },
//     day: [
//       { date: "2026-06-06", maxTemp: 39.5, minTemp: 27.8, avgTemp: 32.8 },
//       { date: "2026-06-07", maxTemp: 39.7, minTemp: 27.4, avgTemp: 32.6 },
//       { date: "2026-06-08", maxTemp: 38.9, minTemp: 27.0, avgTemp: 31.9 },
//       { date: "2026-06-09", maxTemp: 39.0, minTemp: 27.1, avgTemp: 32.2 },
//       { date: "2026-06-10", maxTemp: 39.5, minTemp: 27.6, avgTemp: 32.7 },
//       { date: "2026-06-11", maxTemp: 40.1, minTemp: 27.8, avgTemp: 33.0 },
//       { date: "2026-06-12", maxTemp: 40.4, minTemp: 27.9, avgTemp: 33.0 },
//     ]
//   };
//   render(currentData);
//   el('statusBar').textContent = '⚡ Demo mode — connect your API to see live data';
// };

/* ── Unit toggle ───────────────────────────────────────── */
window.setUnit = (celsius) => {
  isCelsius = celsius;
  if (currentData) render(currentData);
};

/* ── Search handler ────────────────────────────────────── */
window.doSearch = () => {
  const city = el('cityInput').value.trim() || DEFAULT_CITY;
  let days = parseInt(el('daysInput').value);
  if (!days || days < 1) days = 1;
  if (days > 30) days = 30;
  el('cityInput').value = city;
  el('daysInput').value = days;
  const titleEl = el('forecastTitle');
  if (titleEl) titleEl.textContent = `${days}-Day Forecast`;
  fetchWeather(city, days);
};

window.handleKey = (e) => { if (e.key === 'Enter') window.doSearch(); };

/* ── Resize → redraw chart ────────────────────────────── */
window.addEventListener('resize', () => {
  if (currentData) drawChart(currentData.day);
});

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  fetchWeather(DEFAULT_CITY, DEFAULT_DAYS);
});