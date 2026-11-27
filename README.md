# NahwuQuest — Atlas Nahwu dan Studio Guru

## Mulai bermain
Buka Home → Daftar akun. Pilih nama pengguna untuk masuk, kata sandi minimal 8 karakter, dan nama karakter yang tampil di game. Pilihan **Tetap masuk di perangkat ini** menyimpan sesi hingga 30 hari. Di komputer bersama gunakan **Keluar akun** setelah bermain. Masuk kembali dengan nama pengguna dan kata sandi yang sama dari perangkat lain untuk melanjutkan. Mengganti nama karakter tidak mengubah nama pengguna.

## Membawa data lama
Daftar dari browser, perangkat, dan alamat situs tempat profil lama dimainkan. Pada formulir Daftar pilih **Progres awal → Impor profil lokal**. Periksa nama karakter, lalu daftar. Quest, langkah latihan, skin, wilayah, dan identitas arena lama yang tersedia ikut dibawa. Rank lama membutuhkan database arena yang sama. Profil lama tanpa password adalah data lokal yang dapat dipilih oleh pengguna perangkat tersebut. Impor dilakukan ketika membuat akun.

## Mengaktifkan Studio Guru
1. Daftar akun pribadi, lalu salin **ID akun** yang muncul di menu **Karakter**.
2. Sebagai pemilik proyek, isi environment variable server `TEACHER_ACCOUNT_IDS` dengan ID tersebut (pisahkan beberapa ID dengan koma tanpa spasi). Di Vercel pilih **Settings → Environment Variables**, aktifkan untuk Production, lalu redeploy. Pada server lokal, set variabel sebelum menjalankan ulang Python dengan database yang sama.
3. Muat ulang game. Buka **Studio Guru** untuk membuat atau mengubah map dan quest, termasuk materi bawaan. Pada tiap quest, isi 1–30 soal, satu jawaban benar, dua pengecoh, dan pembahasan opsional. Tekan **Terbitkan**. Siswa yang sudah membuka game perlu memuat ulang. Quest yang selesai hanya memberi 50 XP sekali. Studio mengatur latihan Atlas. Lobi multiplayer memakai bank soal balapan tersendiri.

## Deploy dari GitHub ke Vercel
1. Ekstrak ZIP. Commit **isinya** ke root repositori GitHub pada branch `main`. Pastikan `api/arena.py`, `dist/`, `server.py`, `requirements.txt`, `vercel.json`, `accounts.py`, `catalog.json`, dan `.github/workflows/pages.yml` ada di repositori.
2. Siapkan database PostgreSQL persisten (misalnya Neon). Salin **pooled connection string** dengan TLS dari provider. Role database perlu izin membuat schema dan tabel pada database ini. Arena membuat schema `nahwuquest` saat permintaan pertama.
3. Di Vercel, pilih **Add New → Project**, impor repositori, gunakan root proyek dan preset **Other**. Tambahkan environment variable `DATABASE_URL` untuk **Production** berisi connection string tadi. Simpan kredensial hanya di Vercel. Klik **Deploy**. Jika variabel diubah setelah deploy, pilih **Redeploy**.
4. Buka domain produksi, daftar atau masuk dengan kata sandi, lalu buka **Lobi Multiplayer**. Pastikan tombol **Buat ruangan** muncul dan ruangan bisa dibuat. Gunakan domain produksi yang dapat diakses pemain tanpa login Vercel. Setiap push berikutnya ke branch produksi memicu deployment melalui integrasi GitHub Vercel.

## Publikasikan juga ke GitHub Pages
1. Di repositori GitHub pilih **Settings → Pages → Source → GitHub Actions**.
2. Di **Settings → Secrets and variables → Actions → Variables**, buat **repository variable** bernama `ARENA_BACKEND_URL`. Isi dengan origin publik deployment Vercel, misalnya `https://nama-proyek.vercel.app`. Ganti contoh dengan domain milikmu, tanpa path atau `/api/arena`. Nilainya menjadi bagian dari frontend publik.
3. Pilih **Actions → Publikasikan NahwuQuest → Run workflow** dari branch `main`. Push berikutnya ke `main` juga menerbitkan perubahan. Setelah mengganti variabel, jalankan workflow lagi.
4. Buka URL dari **Settings → Pages**. Untuk mengecek kedua deployment, buat ruangan di Vercel, lalu masuk dari Pages dengan profil kedua menggunakan kode yang sama. Selesaikan balapan dan cek XP serta rank di kedua layar.

Vercel menyajikan game dan API. GitHub Pages menyajikan game yang menghubungi API Vercel yang sama. Kedua alamat berbagi ruangan dan database arena. Kedua alamat juga berbagi akun, progres, dan materi guru. Masuk sekali pada masing-masing alamat.

## Arena multiplayer
Jalankan **python3 server.py** dari folder proyek (Python 3.9+). Buka http://localhost:8000, masuk dengan profil, lalu pilih **Lobi Multiplayer**. Di Wi-Fi yang sama, teman membuka http://IP-LAN-KOMPUTER:8000 dengan alamat IP komputer yang menjalankan server. Gunakan server dan database yang sama untuk mengakses akun yang sudah dibuat. Untuk akses selain localhost gunakan HTTPS agar kata sandi terlindungi saat dikirim. Untuk internet, jalankan satu instance server di host Python dengan HTTPS dan penyimpanan persisten. PORT mengatur port (default 8000), NAHWU_DB mengatur lokasi berkas SQLite (default arena.sqlite3).

Buat ruangan Sprint I‘rāb atau Reli Susun Kalimat. Teman bergabung lewat daftar atau kode. Setelah 2–4 pemain menekan Saya siap, host memulai hitung mundur bersama. Setiap pemain mendapat lima soal dan urutan pilihan yang sama. Jawaban salah memberi jeda dua detik. Server menentukan urutan finis berdasarkan penerimaan jawaban benar terakhir dalam batas tiga menit. Pemain pertama mendapat 100 XP dan 30 RP, finisher lain 50 XP dan 12 RP. Keluar sebelum finis atau kehabisan waktu memberi 0. Rank berdasarkan RP kumulatif: Perunggu 0, Perak 60, Emas 150, Safir 300, Master 600. XP arena ditambahkan ke total XP profil. Skin tetap terbuka melalui quest Atlas.

Muat ulang halaman lobi untuk melanjutkan balapan pada browser dan profil yang sama. Saat menunggu, kursi pemain yang tidak terhubung selama 60 detik dilepas. Host berpindah ke pemain berikutnya. Hadiah arena terhubung dengan identitas arena akun. Masuk kembali untuk mengambil rank dari server.
