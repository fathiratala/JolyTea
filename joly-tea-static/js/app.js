/* Joly Tea — versi HTML statis. Semua data (akun, keranjang, pesanan) tersimpan di localStorage browser (simulasi). */
(function () {
  'use strict';
  var PRODUCTS = [
    { id: 1, name: 'Thai Tea', price: 10000, img: 'img/products/thai-tea.jpg', desc: 'Teh Thailand klasik dengan warna oranye khas, manis, creamy, dan menyegarkan.', badge: '' },
    { id: 2, name: 'Roasted Milk Tea', price: 13000, img: 'img/products/roasted-milk-tea.jpg', desc: 'Milk tea dengan aroma teh sangrai yang smoky, gurih, dan khas. Produk unggulan Joly Tea.', badge: 'Produk Unggulan' }
  ];
  var BANK = { name: 'BCA', number: '8050609651', holder: 'FATHIR ATALA FAYOLDI' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rp = function (n) { return 'Rp' + Number(n || 0).toLocaleString('id-ID'); };
  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };

  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var users = function () { return load('jt_users', []); };
  var session = function () { var em = load('jt_session', null); return em ? users().filter(function (u) { return u.email === em; })[0] || null : null; };
  var cart = function () { return load('jt_cart', []); };
  var orders = function () { return load('jt_orders', []); };

  function toast(msg, type) {
    var w = $('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    var t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.textContent = msg; w.appendChild(t);
    setTimeout(function () { t.remove(); }, 3000);
  }
  function go(url) { location.href = url; }
  function nextParam() { var m = location.search.match(/[?&]next=([^&]+)/); var n = m ? decodeURIComponent(m[1]) : ''; return /^[a-z-]+\.html(\?.*)?$/.test(n) ? n : ''; }
  function requireLogin() { if (!session()) { go('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return false; } return true; }
  function setErrors(form, f) {
    $$('.field', form).forEach(function (x) { x.classList.remove('invalid'); var e = $('.field-error', x); if (e) e.textContent = ''; });
    Object.keys(f).forEach(function (k) { var i = form.elements[k]; if (!i) return; var fld = (i.length && !i.tagName ? i[0] : i).closest('.field'); if (fld) { fld.classList.add('invalid'); $('.field-error', fld).textContent = f[k]; } });
    return Object.keys(f).length === 0;
  }
  var WA_RE = /^(\+62|62|0)8\d{7,12}$/;

  /* ---------- Header ---------- */
  function badge() { var b = $('#cart-badge'); if (!b) return; var c = cart().reduce(function (s, i) { return s + i.qty; }, 0); b.textContent = c > 99 ? '99+' : c; b.hidden = c <= 0; }
  function header() {
    var u = session(), box = $('#nav-auth');
    box.innerHTML = u
      ? '<a class="user-chip" href="profile.html">Hai, ' + esc(u.name.split(' ')[0]) + '</a><a class="btn btn-outline btn-sm" href="#" id="logout">Logout</a>'
      : '<a class="btn btn-ghost btn-sm" href="login.html">Login</a><a class="btn btn-primary btn-sm" href="register.html">Register</a>';
    var lo = $('#logout'); if (lo) lo.addEventListener('click', function (e) { e.preventDefault(); localStorage.removeItem('jt_session'); go('index.html'); });
    badge();
  }
  function navToggle() {
    var t = $('#nav-toggle'), h = $('#site-header');
    t.addEventListener('click', function () { var o = h.classList.toggle('nav-open'); t.setAttribute('aria-expanded', String(o)); });
  }

  /* ---------- Produk ---------- */
  function card(p) {
    return '<article class="card product-card" data-search="' + esc((p.name + ' ' + p.desc).toLowerCase()) + '">' +
      '<a class="thumb" href="menu.html"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy" width="400" height="500"></a>' +
      '<div class="body">' + (p.badge ? '<span class="tag">' + esc(p.badge) + '</span>' : '') +
      '<h3><a href="menu.html">' + esc(p.name) + '</a></h3><p class="desc">' + esc(p.desc) + '</p>' +
      '<div class="price">' + rp(p.price) + ' <small class="muted" style="font:500 .8rem var(--font-body)">/ unit</small></div>' +
      '<div class="card-actions"><a class="btn btn-outline btn-sm" href="menu.html">View Details</a>' +
      '<button class="btn btn-primary btn-sm" type="button" data-add="' + p.id + '">Add to Cart</button></div></div></article>';
  }
  function fillGrid(sel) { var g = $(sel); if (g) g.innerHTML = PRODUCTS.map(card).join(''); }
  function menuSearch() {
    var q = $('#q'); if (!q) return;
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(), n = 0;
      $$('#products .product-card').forEach(function (c) { var hit = !v || c.dataset.search.indexOf(v) > -1; c.hidden = !hit; if (hit) n++; });
      $('#count').textContent = n + ' menu'; $('#no-results').hidden = n > 0;
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]'); if (!b) return;
    var id = Number(b.dataset.add), c = cart(), cur = c.filter(function (i) { return i.id === id; })[0];
    if (cur) cur.qty = Math.min(99, cur.qty + 1); else c.push({ id: id, qty: 1 });
    save('jt_cart', c); badge(); toast(byId(id).name + ' ditambahkan ke keranjang', 'success');
  });

  /* ---------- Keranjang ---------- */
  function cartPage() {
    var root = $('#cart-root'); if (!root) return;
    function render() {
      var items = cart().filter(function (i) { return byId(i.id); }), total = 0, count = 0;
      badge();
      if (!items.length) { root.innerHTML = '<div class="card empty"><img class="empty-logo" src="img/logo.png" alt="" width="88" height="88"><h2>Keranjangmu masih kosong</h2><p class="muted">Yuk pilih milk tea favoritmu dulu.</p><a class="btn btn-primary" href="menu.html">Lihat Menu</a></div>'; return; }
      var rows = items.map(function (i) {
        var p = byId(i.id), sub = p.price * i.qty; total += sub; count += i.qty;
        return '<div class="cart-item" data-id="' + p.id + '"><img src="' + p.img + '" alt="' + esc(p.name) + '" width="84" height="84"><div><h3>' + esc(p.name) + '</h3><div class="muted">' + rp(p.price) + ' / unit</div>' +
          '<div class="ctrl"><div class="qty"><button type="button" data-act="dec">&minus;</button><input type="number" min="1" max="99" value="' + i.qty + '" data-act="set"><button type="button" data-act="inc">+</button></div><button class="link-btn" type="button" data-act="rm">Hapus</button></div></div><div class="line-total">' + rp(sub) + '</div></div>';
      }).join('');
      root.innerHTML = '<div class="cart-layout"><div class="card">' + rows + '</div><aside class="card summary"><h2>Ringkasan</h2><div class="sum-row"><span>Jumlah item</span><span>' + count + '</span></div><div class="sum-row total"><span>Total</span><span>' + rp(total) + '</span></div><a class="btn btn-primary btn-block" href="' + (session() ? 'checkout.html' : 'login.html?next=checkout.html') + '">' + (session() ? 'Lanjut ke Checkout' : 'Login untuk Checkout') + '</a><a class="btn btn-ghost btn-block" href="menu.html" style="margin-top:.5rem">Tambah menu lain</a></aside></div>';
    }
    function setQty(id, q) { var c = cart().filter(function (i) { return i.id !== id || q > 0; }).map(function (i) { if (i.id === id) i.qty = Math.min(99, q); return i; }); save('jt_cart', c); render(); }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]'); if (!b) return;
      var row = b.closest('.cart-item'), id = Number(row.dataset.id), cur = Number($('input', row).value) || 1;
      setQty(id, b.dataset.act === 'inc' ? cur + 1 : b.dataset.act === 'dec' ? cur - 1 : 0);
    });
    root.addEventListener('change', function (e) { var i = e.target.closest('input[data-act=set]'); if (i) setQty(Number(i.closest('.cart-item').dataset.id), parseInt(i.value, 10) || 0); });
    render();
  }

  /* ---------- Checkout & pembayaran ---------- */
  function checkoutPage() {
    var root = $('#checkout-root'); if (!root || !requireLogin()) return;
    var u = session(), m = location.search.match(/[?&]pay=(\d+)/);
    if (m) return payScreen(root, Number(m[1]), u);
    var items = cart().filter(function (i) { return byId(i.id); }), total = items.reduce(function (s, i) { return s + byId(i.id).price * i.qty; }, 0);
    if (!items.length) { root.innerHTML = '<div class="card empty"><img class="empty-logo" src="img/logo.png" alt="" width="88" height="88"><h2>Keranjangmu kosong</h2><p class="muted">Tambahkan menu dulu sebelum checkout.</p><a class="btn btn-primary" href="menu.html">Lihat Menu</a></div>'; return; }
    root.innerHTML = '<div class="cart-layout"><form id="co-form" class="card checkout-form" style="padding:1.6rem" novalidate><h2>Pengambilan</h2>' +
      '<div class="field"><div class="radio-cards cols2"><label class="radio-card"><input type="radio" name="fulfillment" value="delivery" checked><span>Diantar<small>Semarang dan sekitarnya</small></span></label><label class="radio-card"><input type="radio" name="fulfillment" value="pickup"><span>Ambil di tempat<small>Tanpa ongkir</small></span></label></div></div>' +
      '<div class="row2"><div class="field"><label for="name">Nama penerima</label><input id="name" name="name" value="' + esc(u.name) + '"><div class="field-error"></div></div><div class="field"><label for="phone">No. WhatsApp / HP</label><input id="phone" name="phone" type="tel" value="' + esc(u.whatsapp || '') + '" placeholder="081234567890"><div class="field-error"></div></div></div>' +
      '<div class="field" id="addr"><label for="address">Alamat pengantaran</label><textarea id="address" name="address" placeholder="Nama jalan, nomor, kelurahan, patokan"></textarea><div class="field-error"></div></div>' +
      '<h2>Bayar dengan</h2><div class="field"><div class="radio-cards"><label class="radio-card"><input type="radio" name="pay" value="qris" checked><span>QRIS<small>Scan dengan e-wallet atau m-banking apa pun</small></span></label><label class="radio-card"><input type="radio" name="pay" value="transfer"><span>Transfer BCA<small>Transfer ke rekening BCA Joly Tea</small></span></label><label class="radio-card"><input type="radio" name="pay" value="cod"><span>Bayar di tempat (COD)<small>Tunai saat pesanan diterima atau diambil</small></span></label></div></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Buat Pesanan</button></form>' +
      '<aside class="card summary"><h2>Pesananmu</h2>' + items.map(function (i) { return '<div class="sum-row"><span>' + i.qty + ' × ' + esc(byId(i.id).name) + '</span><span>' + rp(byId(i.id).price * i.qty) + '</span></div>'; }).join('') + '<div class="sum-row total"><span>Total</span><span>' + rp(total) + '</span></div><a class="btn btn-ghost btn-block" href="cart.html" style="margin-top:.8rem">&larr; Ubah keranjang</a></aside></div>';
    var form = $('#co-form');
    var sync = function () { $('#addr').hidden = form.elements.fulfillment.value !== 'delivery'; }; form.addEventListener('change', sync); sync();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = {}, v = {}; new FormData(form).forEach(function (x, k) { v[k] = x; });
      if (v.name.trim().length < 2) f.name = 'Nama penerima minimal 2 karakter.';
      if (!WA_RE.test(v.phone.replace(/[\s-]/g, ''))) f.phone = 'Nomor tidak valid (contoh: 081234567890).';
      if (v.fulfillment === 'delivery' && (v.address || '').trim().length < 10) f.address = 'Alamat pengantaran minimal 10 karakter.';
      if (!setErrors(form, f)) return;
      var all = orders(), id = (load('jt_order_seq', 0)) + 1; save('jt_order_seq', id);
      all.push({ id: id, email: u.email, date: Date.now(), name: v.name, phone: v.phone, fulfillment: v.fulfillment, address: v.address || '', method: v.pay, total: total, status: 'pending', paid: false, items: items.map(function (i) { return { name: byId(i.id).name, price: byId(i.id).price, qty: i.qty }; }) });
      save('jt_orders', all); save('jt_cart', []);
      go(v.pay === 'cod' ? 'history.html?new=' + id : 'checkout.html?pay=' + id);
    });
  }
  function payScreen(root, id, u) {
    var o = orders().filter(function (x) { return x.id === id && x.email === u.email; })[0];
    if (!o || o.paid || o.method === 'cod' || o.status === 'cancelled') return go('history.html');
    var q = o.method === 'qris';
    root.innerHTML = '<div class="cart-layout"><section class="card pay-card"><span class="status status-pending">Menunggu pembayaran</span><h2>Bayar ' + rp(o.total) + '</h2><p class="muted">Pesanan #' + o.id + ' &middot; ' + (q ? 'QRIS' : 'Transfer BCA') + '</p>' +
      (q ? '<div class="qr-box"><img class="qr-img" src="img/qris.png" alt="QRIS Joly Tea" width="320" height="454"></div><p class="center muted">Scan dengan e-wallet atau m-banking apa pun.</p>'
         : '<div class="va-box"><div><span class="muted">Bank</span><strong>' + BANK.name + '</strong></div><div><span class="muted">Nomor rekening</span><strong class="va-num">' + BANK.number + '</strong></div><div><span class="muted">Atas nama</span><strong>' + BANK.holder + '</strong></div></div>') +
      '<div class="pay-note">Ini simulasi: tekan tombol di bawah untuk menandai pesanan sudah dibayar.</div><div class="pay-actions"><button class="btn btn-primary btn-block" id="paid">Saya Sudah Bayar</button><a class="btn btn-ghost btn-block" href="history.html">Bayar nanti</a></div></section>' +
      '<aside class="card summary"><h2>Pesananmu</h2>' + o.items.map(function (i) { return '<div class="sum-row"><span>' + i.qty + ' × ' + esc(i.name) + '</span><span>' + rp(i.price * i.qty) + '</span></div>'; }).join('') + '<div class="sum-row total"><span>Total</span><span>' + rp(o.total) + '</span></div></aside></div>';
    $('#paid').addEventListener('click', function () {
      var all = orders(); all.forEach(function (x) { if (x.id === id) { x.paid = true; if (x.status === 'pending') x.status = 'processing'; } }); save('jt_orders', all); go('history.html?new=' + id);
    });
  }

  /* ---------- Riwayat transaksi ---------- */
  function historyPage() {
    var root = $('#history-root'); if (!root || !requireLogin()) return;
    var u = session(), list = orders().filter(function (o) { return o.email === u.email; }).sort(function (a, b) { return b.id - a.id; });
    var S = { pending: 'Menunggu', processing: 'Diproses', done: 'Selesai', cancelled: 'Dibatalkan' }, P = { cod: 'Bayar di tempat (COD)', transfer: 'Transfer BCA', qris: 'QRIS' };
    var nm = location.search.match(/[?&]new=(\d+)/), html = '';
    if (nm) html += '<div class="success-box" role="status"><h2>Pesanan #' + esc(nm[1]) + ' berhasil dibuat!</h2><p class="muted">Terima kasih. Riwayat transaksimu ada di bawah.</p></div>';
    if (!list.length) { root.innerHTML = html + '<div class="card empty"><img class="empty-logo" src="img/logo.png" alt="" width="88" height="88"><h2>Belum ada transaksi</h2><p class="muted">Transaksi yang kamu buat akan muncul di sini.</p><a class="btn btn-primary" href="menu.html">Pesan Sekarang</a></div>'; return; }
    html += '<div class="card table-wrap"><table><thead><tr><th>No. Pesanan</th><th>Tanggal</th><th>Item</th><th>Total</th><th>Metode</th><th>Pembayaran</th><th>Status</th><th></th></tr></thead><tbody>' + list.map(function (o) {
      var needs = o.method !== 'cod' && !o.paid && o.status !== 'cancelled';
      return '<tr><td><strong>#' + o.id + '</strong></td><td>' + esc(new Date(o.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })) + '</td><td>' + o.items.map(function (i) { return i.qty + ' × ' + esc(i.name); }).join('<br>') + '</td><td><strong>' + rp(o.total) + '</strong></td><td>' + P[o.method] + '</td><td><span class="status ' + (o.paid ? 'status-done' : 'status-pending') + '">' + (o.paid ? 'Lunas' : o.method === 'cod' ? 'Bayar saat diterima' : 'Belum dibayar') + '</span></td><td><span class="status status-' + o.status + '">' + S[o.status] + '</span></td><td>' + (needs ? '<a class="btn btn-primary btn-sm" href="checkout.html?pay=' + o.id + '">Bayar</a>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    root.innerHTML = html;
  }

  /* ---------- Profil ---------- */
  function profilePage() {
    var root = $('#profile-root'); if (!root || !requireLogin()) return;
    var u = session(), mine = orders().filter(function (o) { return o.email === u.email; });
    var spent = mine.filter(function (o) { return o.paid && o.status !== 'cancelled'; }).reduce(function (s, o) { return s + o.total; }, 0);
    root.innerHTML = '<div class="grid stats" style="margin-bottom:1.5rem"><div class="card stat"><span>Total transaksi</span><strong>' + mine.length + '</strong></div><div class="card stat"><span>Total belanja (lunas)</span><strong>' + rp(spent) + '</strong></div></div>' +
      '<div class="card" style="padding:1.6rem"><form id="pf" novalidate>' +
      '<div class="field"><label>Username</label><input value="' + esc(u.username) + '" readonly disabled><div class="field-hint">Username tidak dapat diubah.</div></div>' +
      '<div class="field"><label for="name">Nama lengkap</label><input id="name" name="name" value="' + esc(u.name) + '" maxlength="80"><div class="field-error"></div></div>' +
      '<div class="field"><label>Email</label><input type="email" value="' + esc(u.email) + '" readonly disabled><div class="field-hint">Email dipakai untuk login dan tidak dapat diubah.</div></div>' +
      '<div class="field"><label for="whatsapp">Nomor WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" value="' + esc(u.whatsapp || '') + '" placeholder="081234567890"><div class="field-error"></div></div>' +
      '<button class="btn btn-primary" type="submit">Simpan Perubahan</button> <a class="btn btn-ghost" href="history.html">Lihat Riwayat Transaksi</a></form></div>';
    var form = $('#pf');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var f = {}, n = form.elements.name.value.trim(), w = form.elements.whatsapp.value.replace(/[\s-]/g, '');
      if (n.length < 2) f.name = 'Nama lengkap minimal 2 karakter.';
      if (!WA_RE.test(w)) f.whatsapp = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
      if (!setErrors(form, f)) return;
      var all = users(); all.forEach(function (x) { if (x.email === u.email) { x.name = n; x.whatsapp = w; } }); save('jt_users', all);
      toast('Profil berhasil disimpan.', 'success'); header();
    });
  }

  /* ---------- Login & register ---------- */
  function authForms() {
    $$('[data-toggle-pw]').forEach(function (b) { b.addEventListener('click', function () { var i = document.getElementById(b.dataset.togglePw), s = i.type === 'password'; i.type = s ? 'text' : 'password'; b.textContent = s ? 'Sembunyikan' : 'Tampilkan'; }); });
    var EM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, next = nextParam();
    var nl = $('#to-login'), nr = $('#to-register'); if (next) { if (nl) nl.href += '?next=' + encodeURIComponent(next); if (nr) nr.href += '?next=' + encodeURIComponent(next); }
    var lf = $('#login-form'), rf = $('#register-form'), eb = $('#form-error');
    function fail(m) { eb.textContent = m; eb.hidden = false; }
    if (lf) lf.addEventListener('submit', function (e) {
      e.preventDefault(); eb.hidden = true; var f = {}, em = lf.elements.email.value.trim().toLowerCase(), pw = lf.elements.password.value;
      if (!EM.test(em)) f.email = 'Format email tidak valid.'; if (!pw) f.password = 'Password wajib diisi.';
      if (!setErrors(lf, f)) return;
      var u = users().filter(function (x) { return x.email === em && x.password === pw; })[0];
      if (!u) return fail('Email atau password salah.');
      save('jt_session', u.email); go(next || 'index.html');
    });
    if (rf) rf.addEventListener('submit', function (e) {
      e.preventDefault(); eb.hidden = true; var f = {}, v = {}; new FormData(rf).forEach(function (x, k) { v[k] = x; }); var em = v.email.trim().toLowerCase();
      if (v.name.trim().length < 2) f.name = 'Nama lengkap minimal 2 karakter.';
      if (!EM.test(em)) f.email = 'Format email tidak valid.';
      if (!WA_RE.test(v.whatsapp.replace(/[\s-]/g, ''))) f.whatsapp = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
      if (v.password.length < 8) f.password = 'Password minimal 8 karakter.'; else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) f.password = 'Password harus mengandung huruf dan angka.';
      if (v.password !== v.confirmPassword) f.confirmPassword = 'Konfirmasi password tidak sama.';
      if (!f.email && users().some(function (x) { return x.email === em; })) f.email = 'Email sudah terdaftar.';
      if (!setErrors(rf, f)) return;
      var base = em.split('@')[0].replace(/[^a-z0-9._-]/g, '') || 'pelanggan', un = base, n = 2;
      while (users().some(function (x) { return x.username === un; })) un = base + n++;
      var all = users(); all.push({ username: un, name: v.name.trim(), email: em, whatsapp: v.whatsapp.replace(/[\s-]/g, ''), password: v.password }); save('jt_users', all);
      save('jt_session', em); go(next || 'index.html');
    });
  }

  function init() {
    navToggle(); header(); fillGrid('#featured'); fillGrid('#products'); fillGrid('#about-products');
    var c = $('#count'); if (c) c.textContent = PRODUCTS.length + ' menu';
    menuSearch(); cartPage(); checkoutPage(); historyPage(); profilePage(); authForms();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
