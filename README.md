# NahwuQuest — Atlas Nahwu
Enam wilayah, 18 quest, 90 soal dan 12 skin.

## Bermain
Buka Home dan masukkan nama karakter. Login ini memilih profil lokal di browser dan perangkat yang sama. Pemain yang memakai browser bersama dapat berganti profil di Home. Nama bisa diganti di Karakter. Setiap jawaban benar memicu penyimpanan. Lima jawaban benar menuntaskan quest dan memberikan 50 XP pada penyelesaian pertama.

## Deploy dari GitHub ke Vercel
1. Ekstrak ZIP. Commit **isinya** ke root repositori GitHub pada branch `main`. Pastikan `api/arena.py`, `dist/`, `server.py`, `requirements.txt`, `vercel.json`, dan `.github/workflows/pages.yml` ada di repositori.
2. Siapkan database PostgreSQL persisten (misalnya Neon). Salin **pooled connection string** dengan TLS dari provider. Role database perlu izin membuat schema dan tabel pada database ini. Arena membuat schema `nahwuquest` saat permintaan pertama.
3. Di Vercel, pilih **Add New → Project**, impor repositori, gunakan root proyek dan preset **Other**. Tambahkan environment variable `DATABASE_URL` untuk **Production** berisi connection string tadi. Simpan kredensial hanya di Vercel. Klik **Deploy**. Jika variabel diubah setelah deploy, pilih **Redeploy**.
4. Buka domain produksi, masuk dengan nama karakter, lalu buka **Lobi Multiplayer**. Pastikan tombol **Buat ruangan** muncul dan ruangan bisa dibuat. Gunakan domain produksi yang dapat diakses pemain tanpa login Vercel. Setiap push berikutnya ke branch produksi memicu deployment melalui integrasi GitHub Vercel.

## Publikasikan juga ke GitHub Pages
1. Di repositori GitHub pilih **Settings → Pages → Source → GitHub Actions**.
2. Di **Settings → Secrets and variables → Actions → Variables**, buat **repository variable** bernama `ARENA_BACKEND_URL`. Isi dengan origin publik deployment Vercel, misalnya `https://nama-proyek.vercel.app`. Ganti contoh dengan domain milikmu, tanpa path atau `/api/arena`. Nilainya menjadi bagian dari frontend publik.
3. Pilih **Actions → Publikasikan NahwuQuest → Run workflow** dari branch `main`. Push berikutnya ke `main` juga menerbitkan perubahan. Setelah mengganti variabel, jalankan workflow lagi.
4. Buka URL dari **Settings → Pages**. Untuk mengecek kedua deployment, buat ruangan di Vercel, lalu masuk dari Pages dengan profil kedua menggunakan kode yang sama. Selesaikan balapan dan cek XP serta rank di kedua layar.

Vercel menyajikan game dan API. GitHub Pages menyajikan game yang menghubungi API Vercel yang sama. Kedua alamat berbagi ruangan dan database arena. Profil dan identitas yang tersimpan di browser terikat pada alamat situs. Untuk melanjutkan rank pribadi, gunakan alamat dan browser yang sama.

## Simpanan lama
Pada browser dan alamat situs yang sama, profil pertama mengambil misi, skin, dan wilayah dari edisi Atlas atau Desa Alif. Simpanan dari alamat yang berbeda terpisah. Hindari mode privat jika ingin mempertahankan progres setelah browser ditutup.

## Arena multiplayer
Jalankan **python3 server.py** dari folder proyek (Python 3.9+). Buka http://localhost:8000, masuk dengan profil, lalu pilih **Lobi Multiplayer**. Di Wi-Fi yang sama, teman membuka http://IP-LAN-KOMPUTER:8000 dengan alamat IP komputer yang menjalankan server. Gunakan alamat yang sama setiap kali bermain agar profil browser tetap dikenali. Untuk internet, jalankan satu instance server di host Python dengan HTTPS dan penyimpanan persisten. PORT mengatur port (default 8000), NAHWU_DB mengatur lokasi berkas SQLite (default arena.sqlite3).

Buat ruangan Sprint I‘rāb atau Reli Susun Kalimat. Teman bergabung lewat daftar atau kode. Setelah 2–4 pemain menekan Saya siap, host memulai hitung mundur bersama. Setiap pemain mendapat lima soal dan urutan pilihan yang sama. Jawaban salah memberi jeda dua detik. Server menentukan urutan finis berdasarkan penerimaan jawaban benar terakhir dalam batas tiga menit. Pemain pertama mendapat 100 XP dan 30 RP, finisher lain 50 XP dan 12 RP. Keluar sebelum finis atau kehabisan waktu memberi 0. Rank berdasarkan RP kumulatif: Perunggu 0, Perak 60, Emas 150, Safir 300, Master 600. XP arena ditambahkan ke total XP profil. Skin tetap terbuka melalui quest Atlas.

Muat ulang halaman lobi untuk melanjutkan balapan pada browser dan profil yang sama. Saat menunggu, kursi pemain yang tidak terhubung selama 60 detik dilepas. Host berpindah ke pemain berikutnya. Identitas arena tersimpan di browser dan hadiah tersimpan pada server. Menghapus data situs menghilangkan akses profil tersebut.
