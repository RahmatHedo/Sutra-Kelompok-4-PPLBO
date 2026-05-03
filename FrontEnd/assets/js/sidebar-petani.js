/* ============================================
   AGRICHAIN — sidebar-petani.js
   Injects sidebar HTML for petani pages
   ============================================ */

function renderSidebar(activePage) {
  const nav = [
    { id: 'dashboard',    href: 'dashboard.html',    icon: 'ti-home',          label: 'Dashboard' },
    { id: 'input-panen',  href: 'input-panen.html',  icon: 'ti-plus',          label: 'Input Hasil Panen' },
    { id: 'riwayat',      href: 'riwayat.html',      icon: 'ti-clipboard-list',label: 'Riwayat Verifikasi', badge: '…' },
    { id: 'tracking',     href: 'tracking.html',     icon: 'ti-map-pin',       label: 'Tracking Panen', group: 'Monitoring' },
    { id: 'notifikasi',   href: 'notifikasi.html',   icon: 'ti-bell',          label: 'Notifikasi', badge: '…', group: 'Akun' },
    { id: 'profile',      href: 'profile.html',      icon: 'ti-user',          label: 'Profil Saya' },
  ];

  let groups = ['Utama', 'Monitoring', 'Akun'];
  let groupMap = { 'Dashboard': 'Utama', 'Input Hasil Panen': 'Utama', 'Riwayat Verifikasi': 'Utama', 'Tracking Panen': 'Monitoring', 'Notifikasi': 'Akun', 'Profil Saya': 'Akun' };

  let html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <a class="logo-mark" href="../../index.html" style="text-decoration:none">
        <div class="logo-icon"><i class="ti ti-leaf"></i></div>
        <div class="logo-text">Agri<span>Chain</span></div>
      </a>
      <div class="sidebar-role">
        <div class="role-dot"></div>
        Dashboard Petani
      </div>
    </div>
    <nav class="sidebar-nav">
  `;

  let currentGroup = '';
  nav.forEach(item => {
    const g = item.group || (currentGroup === '' ? 'Utama' : currentGroup);
    if (g !== currentGroup) {
      currentGroup = g;
      html += `<div class="nav-label">${g}</div>`;
    }
    const isActive = item.id === activePage ? 'active' : '';
    const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    html += `
      <a class="nav-item ${isActive}" href="${item.href}">
        <i class="ti ${item.icon}"></i>
        ${item.label}
        ${badge}
      </a>`;
  });

  html += `
    </nav>
    <div class="sidebar-footer">
      <a class="sidebar-user" href="profile.html" style="text-decoration:none">
        <div class="user-avatar-sm"><i class="ti ti-user-circle" style="font-size: 32px; color: var(--leaf)"></i></div>
        <div class="user-info-sm">
          <div class="user-name-sm" id="sb-user-name">Memuat...</div>
          <div class="user-sub-sm" id="sb-user-sub">Petani</div>
        </div>
        <i class="ti ti-settings sidebar-footer-icon"></i>
      </a>
      <a href="../../index.html" style="text-decoration:none;display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;color:rgba(255,255,255,.35);font-size:.78rem;margin-top:4px;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.06)'" onmouseout="this.style.background='transparent'">
        <i class="ti ti-logout" style="font-size:15px"></i> Keluar
      </a>
    </div>
  </aside>
  <div class="sidebar-overlay" id="sidebar-overlay"></div>`;

  document.body.insertAdjacentHTML('afterbegin', html);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.nama) {
      document.getElementById('sb-user-name').textContent = user.nama;
      document.getElementById('sb-user-sub').textContent = 'Petani ' + (user.daerah || '');
  }

  // Fetch pending count for badges
  const _token = localStorage.getItem('token');
  if (_token) {
    fetch('http://localhost:3000/api/harvests/petani', { headers: { 'Authorization': 'Bearer ' + _token } })
      .then(r => r.json())
      .then(d => {
        const pending = (d.data || []).filter(h => h.status === 'pending').length;
        const rBadge = document.querySelector('.nav-item[href="riwayat.html"] .nav-badge');
        if (rBadge) {
          rBadge.textContent = pending;
          rBadge.style.background = 'var(--amber)';
          rBadge.style.color = '#fff';
          if (pending === 0) rBadge.style.display = 'none';
        }
        // Notifikasi badge = pending + recently rejected
        const recent = (d.data || []).filter(h => h.status === 'rejected' || h.status === 'pending').length;
        const nBadge = document.querySelector('.nav-item[href="notifikasi.html"] .nav-badge');
        if (nBadge) {
          nBadge.textContent = recent;
          nBadge.style.background = 'var(--amber)';
          nBadge.style.color = '#fff';
          if (recent === 0) nBadge.style.display = 'none';
        }
      }).catch(() => {});
  }
}

function renderTopbar(title, breadcrumb) {
  const html = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-toggle" onclick="toggleSidebar()">
        <i class="ti ti-menu-2"></i>
      </button>
      <div>
        <div class="page-title">${title}</div>
        <div class="breadcrumb">${breadcrumb}</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="search-box"><i class="ti ti-search"></i> Cari data panen...</div>
      <a href="notifikasi.html" class="topbar-icon-btn">
        <i class="ti ti-bell"></i>
        <span class="notif-dot"></span>
      </a>
      <a href="profile.html" class="topbar-avatar" style="background:transparent; color:var(--text-dark)"><i class="ti ti-user-circle" style="font-size: 28px;"></i></a>
    </div>
  </header>`;
  document.querySelector('.main').insertAdjacentHTML('afterbegin', html);
}
