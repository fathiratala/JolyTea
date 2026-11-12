# Joly Tea — versi HTML statis

Halaman: Home (index.html), Menu, About, Riwayat Transaksi, Profil, plus Login, Register, Keranjang, Checkout.

- Tidak butuh server/PHP: buka `index.html` langsung di browser, atau deploy ke Vercel.
- Akun, keranjang, dan pesanan DISIMULASIKAN di localStorage browser (tidak ada pesanan nyata).

## Deploy ke Vercel
1. Upload isi folder ini ke repository GitHub (atau pakai Vercel CLI: `vercel --prod` dari folder ini).
2. Vercel > Add New > Project > pilih repo > Framework Preset: **Other** > Deploy.
   (Build Command & Output Directory dikosongkan; root = folder ini.)
