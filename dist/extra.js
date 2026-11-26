// Setiap baris berisi pertanyaan, jawaban benar, dua pengecoh, dan alasan.
const tambahan = [
[
'Mana nama orang?|زَيْدٌ|ذَهَبَ|عَلَى|Zaid adalah nama seseorang.',
'Apa yang dinamai قَلَمٌ?|Benda|Waktu lampau|Tindakan|Qalam berarti pena.',
'Kata الْمَسْجِدُ termasuk …|Isim|Fi’il|Huruf|Masjid menamai tempat ibadah.'
],[
'Pilih makna جَلَسَ.|Dia telah duduk|Kursi|Duduklah!|Jalasa menyatakan perbuatan lampau.',
'Yang menunjukkan perbuatan membaca ialah …|قَرَأَ|كِتَابٌ|مِنْ|Qara’a berarti dia telah membaca.',
'Apa pembeda utama fi’il dari isim?|Perbuatan yang terkait waktu|Jumlah hurufnya|Selalu berawalan ال|Fi’il menunjukkan tindakan beserta waktunya.'
],[
'Dengan kata mana kita melengkapi “buku di atas meja”?|عَلَى|إِلَى|مِنْ|‘Alā menunjukkan posisi di atas.',
'Mana yang terdiri atas huruf jar dan isim?|فِي بَيْتٍ|بَيْتٌ كَبِيرٌ|جَلَسَ زَيْدٌ|Fī menerangkan hubungan tempat dengan bayt.',
'Apa yang ditunjukkan مِنْ dalam مِنْ بَلَدٍ?|Asal|Tujuan|Waktu lampau|Min baladin berarti dari sebuah negeri.'
],[
'Dalam الْمَاءُ بَارِدٌ, hal yang dibicarakan ialah …|الْمَاءُ|بَارِدٌ|Keduanya khabar|Air adalah mubtada yang diberi keterangan dingin.',
'Makna الْبَيْتُ الْكَبِيرُ sebagai frasa ialah …|Rumah yang besar itu|Rumah itu besar|Di rumah besar|Kata kedua menjadi sifat dari kata rumah.',
'Lengkapi “ilmu itu bermanfaat”, الْعِلْمُ …|نَافِعٌ|فِي|مِنْ|Nāfi‘un memberi keterangan tentang ilmu.'
],[
'Pilih pelaku dalam نَامَ الطِّفْلُ.|الطِّفْلُ|نَامَ|Tidak ada|Anak itulah yang tidur.',
'Apa status fa’il?|Marfu’|Manshub|Majrur|Fa’il memiliki kedudukan rafa’.',
'Dalam ضَحِكَ زَيْدٌ, apa perbuatannya?|Tertawa|Duduk|Membaca|Ḍaḥika berarti telah tertawa.'
],[
'Pilih bentuk untuk “dari pasar itu”.|مِنَ السُّوقِ|مِنَ السُّوقُ|مِنَ السُّوقَ|As-sūq mengikuti huruf jar min.',
'Apa tanda jar pada الْبَيْتِ?|Kasrah|Dammah|Fathah|Huruf terakhir تِ dibaca dengan kasrah.',
'Lengkapi “di atas kursi itu”.|عَلَى الْكُرْسِيِّ|إِلَى الْكُرْسِيِّ|مِنَ الْكُرْسِيِّ|‘Alā menyatakan posisi di atas.'
],[
'Tunjuk pintu yang dekat.|هَذَا بَابٌ|ذَلِكَ بَابٌ|تِلْكَ بَابٌ|Bāb adalah mudzakkar tunggal dan jaraknya dekat.',
'Apa yang ditunjuk هَذِهِ dalam هَذِهِ شَجَرَةٌ?|Sebatang pohon dekat|Sebuah pena jauh|Dua pohon|Syajarah merupakan muannats tunggal.',
'Lengkapi … مُعَلِّمَةٌ untuk guru perempuan di dekatmu.|هَذِهِ|هَذَا|ذَلِكَ|Hādhihi dipakai untuk muannats tunggal yang dekat.'
],[
'Lengkapi … قَلَمٌ untuk pena yang jauh.|ذَلِكَ|هَذَا|هَذِهِ|Dzālika menunjuk mudzakkar tunggal jauh.',
'Untuk tas yang jauh, penunjuknya …|تِلْكَ|هَذِهِ|هَذَا|Ḥaqībah adalah muannats tunggal.',
'Pasangan jarak yang tepat untuk rumah ialah …|هَذَا dekat, ذَلِكَ jauh|هَذَا jauh, ذَلِكَ dekat|Keduanya jauh|Keduanya dapat menunjuk bayt tetapi berlainan jarak.'
],[
'Kata ganti نَحْنُ berarti …|Kami atau kita|Dia perempuan|Kamu laki-laki|Naḥnu adalah orang pertama jamak.',
'Pilih kata ganti untuk Fatimah.|هِيَ|هُوَ|أَنَا|Fatimah adalah orang ketiga perempuan.',
'Saat berbicara kepada satu anak laki-laki, “kamu” ialah …|أَنْتَ|أَنَا|هُوَ|Anta adalah kata ganti orang kedua laki-laki tunggal.'
],[
'Dalam مَدْرَسَةٌ كَبِيرَةٌ apa man’utnya?|مَدْرَسَةٌ|كَبِيرَةٌ|Keduanya sifat|Sekolah adalah benda yang diterangkan.',
'Pilih “sebuah pintu kecil”.|بَابٌ صَغِيرٌ|بَابٌ صَغِيرَةٌ|الْبَابُ صَغِيرٌ|Isim dan sifatnya sama-sama mudzakkar dan tak tentu.',
'Makna كِتَابٌ مُفِيدٌ sebagai frasa ialah …|Sebuah buku yang bermanfaat|Buku siswa itu|Dia membaca buku|Mufīd menerangkan sifat buku.'
],[
'Pilih isim tertentu dengan ال.|الْمَكْتَبُ|مَكْتَبٌ|كَتَبَ|Al-maktab menunjuk meja atau kantor tertentu.',
'Mengapa قَلَمٌ disebut nakirah?|Merujuk pada pena yang belum ditentukan|Menunjukkan waktu|Menunjukkan arah|Nakirah merujuk anggota jenis secara umum.',
'Pasangan “sebuah rumah / rumah itu” ialah …|بَيْتٌ / الْبَيْتُ|الْبَيْتُ / بَيْتٌ|بَيْتٌ / بَيْتٍ|Awalan ال menjadikan kata rumah tertentu.'
],[
'Pada كِتَابُ الْمُعَلِّمِ, kata pertama ialah …|Mudhaf|Mudhaf ilaih|Fa’il|Kitāb adalah benda yang disandarkan kepada guru.',
'Pilih akhir kata kedua dalam قَلَمُ الطَّالِبِ.|Kasrah|Fathah|Dammah|Aṭ-ṭālibi adalah mudhaf ilaih yang majrur.',
'Apa arti مِفْتَاحُ الْبَيْتِ?|Kunci rumah itu|Rumah itu besar|Pintu kelas|Miftāḥ berarti kunci yang disandarkan kepada rumah.'
],[
'Pilih “dia telah masuk”.|دَخَلَ|يَدْخُلُ|اُدْخُلْ|Dakhala adalah fi’il madhi.',
'Apa pelakunya dalam فَتَحَ زَيْدٌ الْبَابَ?|زَيْدٌ|الْبَابَ|فَتَحَ|Zaid melakukan tindakan membuka.',
'Apa perbedaan جَلَسَ dan يَجْلِسُ?|Lampau dan sekarang/akan datang|Benda dan sifat|Pelaku dan objek|Yang pertama madhi, yang kedua mudhari’.'
],[
'Pilih mudhari’ dari ذَهَبَ.|يَذْهَبُ|اِذْهَبْ|ذَهَبَ|Yadzhabu menunjukkan pergi pada masa kini atau nanti.',
'Apa makna الْآنَ dalam يَكْتُبُ الْآنَ?|Sekarang|Kemarin|Dahulu|Al-āna memperjelas waktu berlangsungnya kegiatan.',
'Apa perbuatan dalam تَقْرَأُ مَرْيَمُ?|Membaca|Menulis|Membuka|Taqra’u menyatakan kegiatan membaca.'
],[
'Perintah untuk membaca ialah …|اِقْرَأْ|قَرَأَ|يَقْرَأُ|Iqra’ meminta lawan bicara membaca.',
'Mana kalimat perintah?|اُدْخُلْ|دَخَلَ|يَدْخُلُ|Udkhul berarti masuklah.',
'Kepada siapa اُكْتُبْ ditujukan dalam bentuk ini?|Satu lawan bicara laki-laki|Orang ketiga perempuan|Dua orang|Bentuk tunggal ini memberi perintah langsung kepada lawan bicara laki-laki.'
],[
'Dalam أَكَلَ الْوَلَدُ التُّفَّاحَةَ, apa objeknya?|التُّفَّاحَةَ|الْوَلَدُ|أَكَلَ|Apel adalah sesuatu yang dimakan.',
'Pertanyaan untuk mencari objek dalam “Ali membawa tas” ialah …|Apa yang dibawa?|Siapa yang membawa?|Kapan Ali tiba?|Jawaban atas apa yang dibawa adalah tas.',
'Pilih bentuk objek untuk “aku membaca buku itu”.|قَرَأْتُ الْكِتَابَ|قَرَأْتُ الْكِتَابُ|قَرَأْتُ الْكِتَابِ|Al-kitāba adalah objek langsung yang manshub.'
],[
'Pilih akhir kata dalam هَذَا قَلَمٌ.|Dammatain|Kasratain|Fathatain|Qalamun adalah khabar marfu’ dan tak tentu.',
'Apa kedudukan قَلَمًا dalam اِشْتَرَيْتُ قَلَمًا?|Manshub|Majrur|Marfu’|Pena merupakan objek yang dibeli.',
'Pilih “dengan buku itu”.|بِالْكِتَابِ|بِالْكِتَابَ|بِالْكِتَابُ|Huruf jar bi membuat isim sesudahnya majrur.'
],[
'Siapa pelaku pada contoh Ali meletakkan pena?|عَلِيٌّ|الْقَلَمَ|الْمَكْتَبِ|Ali melakukan tindakan meletakkan.',
'Mengapa الْمَكْتَبِ berakhir dengan kasrah?|Mengikuti عَلَى|Menjadi objek langsung|Menjadi pelaku|Ia isim majrur setelah huruf jar.',
'Pilih urutan analisis وَضَعَ عَلِيٌّ الْقَلَمَ.|Perbuatan, pelaku, objek|Pelaku, objek, perbuatan|Objek, pelaku, perbuatan|Waḍa‘a menyatakan tindakan, Ali pelakunya, dan pena objeknya.'
]];
