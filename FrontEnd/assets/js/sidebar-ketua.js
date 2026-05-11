/* ============================================
   Sutra — sidebar-ketua.js
   Injects sidebar HTML for ketua pages
   ============================================ */

function renderSidebar(activePage) {
  const nav = [
    { id: 'dashboard',          href: 'dashboard.html',          icon: 'ti-home',          label: 'Dashboard' },
    { id: 'verifikasi',         href: 'verifikasi.html',         icon: 'ti-shield-check',  label: 'Verifikasi Panen', badge: 'â€¦' },
    { id: 'manajemen-petani',   href: 'manajemen-petani.html',   icon: 'ti-users',         label: 'Manajemen Petani', group: 'Kelola' },
    { id: 'laporan',            href: 'laporan.html',            icon: 'ti-report-analytics', label: 'Laporan Produksi' },
    { id: 'audit-log',          href: 'audit-log.html',          icon: 'ti-history',       label: 'Audit Log' },
  ];

  let html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <a class="logo-mark" href="../../index.html" style="text-decoration:none">
        <div class="logo-icon"><i class="ti ti-plant"></i></div>
        <div class="logo-text">Su<span>tra</span></div>
      </a>
      <div class="sidebar-role">
        <div class="role-dot"></div>
        Dashboard Ketua
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Utama</div>`;

  let currentGroup = 'Utama';
  nav.forEach(item => {
    const g = item.group || currentGroup;
    if (item.group && item.group !== currentGroup) {
      currentGroup = item.group;
      html += `<div class="nav-label">${currentGroup}</div>`;
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
    <div class="nav-label">Akun</div>
    <a class="nav-item${activePage === 'profile' ? ' active' : ''}" href="profile.html">
      <i class="ti ti-user"></i> Profil Saya
    </a>
    <a class="nav-item${activePage === 'settings' ? ' active' : ''}" href="#" onclick="showToast('Pengaturan segera hadir','info');return false">
      <i class="ti ti-settings"></i> Pengaturan
    </a>
    </nav>
    <div class="sidebar-footer">
      <a class="sidebar-user" href="profile.html" style="text-decoration:none">
        <div class="user-avatar-sm"><i class="ti ti-user-circle" style="font-size: 32px; color: var(--leaf)"></i></div>
        <div class="user-info-sm">
          <div class="user-name-sm" id="sb-user-name">Memuat...</div>
          <div class="user-sub-sm" id="sb-user-sub">Ketua Daerah</div>
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
      document.getElementById('sb-user-sub').textContent = 'Ketua ' + (user.daerah || '');
  }

  // Fetch pending count for badge
  const _token = localStorage.getItem('token');
  if (_token) {
    fetch('http://localhost:3000/api/harvests/stats', { headers: { 'Authorization': 'Bearer ' + _token } })
      .then(r => r.json())
      .then(d => {
        const pending = d.data?.total_pending || 0;
        const badge = document.querySelector('.nav-item[href="verifikasi.html"] .nav-badge');
        if (badge) {
          badge.textContent = pending;
          badge.style.background = 'var(--amber)';
          badge.style.color = '#fff';
          if (pending === 0) badge.style.display = 'none';
        }
        
        // Update topbar notif dot
        const notifDot = document.querySelector('.topbar-right .notif-dot');
        if (notifDot) {
            if (pending > 0) {
                notifDot.style.display = 'flex';
                notifDot.textContent = pending;
            } else {
                notifDot.style.display = 'none';
            }
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
      <div class="search-box"><i class="ti ti-search"></i> Cari petani atau panen...</div>
      <div class="topbar-icon-btn">
        <i class="ti ti-bell"></i>
        <span class="notif-dot"></span>
      </div>
      <a href="profile.html" class="topbar-avatar" style="background:transparent; color:var(--text-dark)"><i class="ti ti-user-circle" style="font-size: 28px;"></i></a>
    </div>
  </header>`;
  document.querySelector('.main').insertAdjacentHTML('afterbegin', html);
}
