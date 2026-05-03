/* ============================================
   AGRICHAIN — main.js
   Shared utilities: Toast, Modal, Sidebar toggle
   ============================================ */

// ── TOAST ──
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'ti ti-circle-check',
    error:   'ti ti-circle-x',
    info:    'ti ti-info-circle',
    warning: 'ti ti-alert-triangle',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type] || icons.success}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ── MODAL ──
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
});

// ── SIDEBAR TOGGLE (Mobile) ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

// ── ACTIVE NAV DETECTION ──
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[href]').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    }
  });
}

// ── DATE HELPER ──
function getTodayString(locale = 'id-ID') {
  return new Date().toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function getTodayShort(locale = 'id-ID') {
  return new Date().toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── CHART RENDERER ──
function renderBarChart(containerId, data, maxVal) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const chartH = 150;
  wrap.innerHTML = data.map(d => `
    <div class="chart-bar-group">
      <div class="bar-wrap">
        <div class="bar primary" style="height:${(d.panen / maxVal) * chartH}px"
          title="${d.panen} ton panen"></div>
        <div class="bar secondary" style="height:${(d.ver / maxVal) * chartH}px"
          title="${d.ver} ton diverifikasi"></div>
      </div>
      <div class="bar-label">${d.month}</div>
    </div>
  `).join('');
}

// ── TABLE FILTER ──
function initFilterBtns(selector, callback) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      callback(this.dataset.filter);
    });
  });
}

// ── FORMAT CURRENCY (Rupiah) ──
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(number);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();

  // Sidebar overlay
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Set dates
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = getTodayShort();
});
