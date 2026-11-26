'use strict';
const lessons = [
 ['Mengenal Isim','Kenali kata yang menamai benda, orang, dan tempat.','book','كِتَابٌ','kitābun · sebuah buku','Isim adalah kata yang menunjukkan suatu nama atau makna tanpa terikat waktu. Nama orang, benda, dan tempat termasuk isim.',[
 ['Manakah isim yang berarti “buku”?',['كِتَابٌ','كَتَبَ','فِي'],0,'كِتَابٌ menamai sebuah benda, yaitu buku.'],
 ['Mengapa مَدْرَسَةٌ (sekolah) termasuk isim?',['Menunjukkan tindakan','Menamai tempat','Menghubungkan dua kata'],1,'Sekolah adalah nama tempat.']]],
 ['Mengenal Fi’il','Temukan kata kerja dan waktu terjadinya.','scroll','كَتَبَ','kataba · dia telah menulis','Fi’il menunjukkan perbuatan yang berkaitan dengan waktu. Fi’il māḍī menyatakan tindakan yang telah terjadi, sedangkan fi’il muḍāri‘ dapat menyatakan tindakan sekarang atau akan datang.',[
 ['Pilih kata yang berarti “dia telah menulis”.',['قَلَمٌ','كَتَبَ','مِنْ'],1,'كَتَبَ adalah fi’il māḍī.'],
 ['Apa makna يَكْتُبُ?',['Dia sedang atau akan menulis','Sebuah tulisan','Dia telah duduk'],0,'يَكْتُبُ adalah bentuk muḍāri‘ dari كَتَبَ.']]],
 ['Mengenal Huruf','Pelajari kata penghubung makna dalam kalimat.','potion','فِي الْبَيْتِ','fī al-bayti · di dalam rumah','Dalam nahwu, huruf adalah kata tugas yang maknanya menjadi jelas bersama kata lain. Contohnya, فِي berarti “di dalam” dan مِنْ berarti “dari”. Keduanya termasuk huruf jar.',[
 ['Lengkapi “di dalam kelas” (… الْفَصْلِ).',['مِنْ','إِلَى','فِي'],2,'فِي menunjukkan tempat berada.'],
 ['Huruf mana yang berarti “dari”?',['فِي','مِنْ','إِلَى'],1,'مِنْ menunjukkan titik asal.']]],
 ['Mubtada dan Khabar','Pasangkan pokok pembicaraan dengan keterangannya.','book','الْبَيْتُ كَبِيرٌ','al-baytu kabīrun · rumah itu besar','Pada contoh ini, الْبَيْتُ adalah mubtada, yaitu hal yang dibicarakan. كَبِيرٌ adalah khabar, yaitu informasi tentang rumah itu.',[
 ['Apa mubtada dalam الْبَيْتُ كَبِيرٌ?',['الْبَيْتُ','كَبِيرٌ'],0,'Rumah adalah hal yang dibicarakan.'],
 ['Apa fungsi جَمِيلٌ dalam الْبُسْتَانُ جَمِيلٌ (kebun itu indah)?',['Mubtada','Khabar'],1,'جَمِيلٌ memberi informasi tentang kebun.']]],
 ['Fi’il dan Fa’il','Cari pelaku dari sebuah perbuatan.','scroll','جَلَسَ الطَّالِبُ','jalasa aṭ-ṭālibu · siswa itu duduk','Dalam kalimat ini, جَلَسَ adalah fi’il yang berarti “telah duduk”. الطَّالِبُ adalah fa’il, yaitu pelaku perbuatan.',[
 ['Siapa fa’il dalam جَلَسَ الطَّالِبُ?',['جَلَسَ','الطَّالِبُ'],1,'Siswalah yang melakukan perbuatan duduk.'],
 ['Pilih fi’il dalam ذَهَبَ الْمُعَلِّمُ (guru itu pergi).',['ذَهَبَ','الْمُعَلِّمُ'],0,'ذَهَبَ menyatakan perbuatan pergi.']]],
 ['Huruf Jar dan Isim','Amati perubahan akhir kata setelah huruf jar.','potion','إِلَى الْمَدْرَسَةِ','ilā al-madrasati · ke sekolah','Isim setelah huruf jar berstatus majrur. Pada isim tunggal seperti الْمَدْرَسَةِ, tandanya adalah kasrah pada huruf terakhir.',[
 ['Pilih bentuk yang tepat setelah فِي.',['الْبَيْتُ','الْبَيْتَ','الْبَيْتِ'],2,'Setelah فِي, kata الْبَيْتِ berakhir dengan kasrah.'],
 ['Apa status الْفَصْلِ dalam مِنَ الْفَصْلِ?',['Majrur','Marfu‘'],0,'مِنْ adalah huruf jar sehingga isim sesudahnya majrur.']]]
];
const skins=['Penjelajah Desa','Penyihir Senja','Saudagar Emas','Penjaga Oasis'], needs=[0,1,3,6];
const $=id=>document.getElementById(id), modal=$('modal'),content=$('content');
let saved={};try{saved=JSON.parse(localStorage.getItem('nahwuquest-v1'))||{}}catch{}
const done=new Set((Array.isArray(saved.done)?saved.done:[]).filter(i=>Number.isInteger(i)&&lessons[i]));
let equipped=Number.isInteger(saved.skin)&&needs[saved.skin]<=done.size?saved.skin:0;
let tab='dunia',stage='',current=0,step=0,pos=12;
function save(){try{localStorage.setItem('nahwuquest-v1',JSON.stringify({done:[...done],skin:equipped}))}catch{}}
function draw(){
 $('world').hidden=tab!=='dunia';$('missions').hidden=tab==='koleksi';$('skins').hidden=tab!=='koleksi';$('all').hidden=tab!=='dunia';
 $('questTitle').textContent=tab==='jurnal'?'Jurnal Misi':'Misi Belajar';
 document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);b.setAttribute('aria-pressed',b.dataset.tab===tab)});
 $('xp').textContent='✦ '+done.size*50+' XP';$('avatar').src='./hero'+equipped+'.png';
 $('cards').innerHTML=lessons.slice(0,tab==='dunia'?3:lessons.length).map(([name,desc,icon],i)=>`<button class="card" data-mission="${i}"><span class="cardtop"><span class="tile"><img alt="" src="./${icon}.png"></span><span class="tag">${done.has(i)?'✓ SELESAI':'MISI 0'+(i+1)}</span></span><h3>${name}</h3><p>${desc}</p><span class="cardfoot"><span class="reward">✦ 50 XP</span><span class="go" aria-hidden="true">→</span></span></button>`).join('');
 $('wardrobe').innerHTML=skins.map((s,i)=>`<button class="card" data-skin="${i}" ${i===equipped||needs[i]>done.size?'disabled':''}><img class="skinImg" alt="" src="./hero${i}.png"><h3>${s}</h3><span class="tag">${i===equipped?'✓ Dipakai':needs[i]>done.size?'Terkunci · '+needs[i]+' misi':'Pakai skin'}</span></button>`).join('');
}
function route(){const h=location.hash.slice(1);tab=['dunia','jurnal','koleksi'].includes(h)?h:'dunia';draw()}
document.querySelector('nav').onclick=e=>{const b=e.target.closest('[data-tab]');if(b)location.hash=b.dataset.tab};
window.addEventListener('hashchange',route);$('all').onclick=()=>location.hash='jurnal';
$('wardrobe').onclick=e=>{let b=e.target.closest('[data-skin]');if(b&&!b.disabled){equipped=Number(b.dataset.skin);save();draw()}};
$('cards').onclick=e=>{let b=e.target.closest('[data-mission]');if(b)lesson(Number(b.dataset.mission))};
function show(html){content.innerHTML=html;if(!modal.open)modal.showModal();modal.scrollTop=0}
$('close').onclick=()=>modal.close();modal.addEventListener('close',()=>{stage=''});
function lesson(i){current=i;step=0;stage='lesson';const [name,,icon,ar,say,info]=lessons[i];show(`<div class="eyebrow">MISI 0${i+1} · MATERI</div><h2>${name}</h2><p>${info}</p><div class="tile"><img alt="" src="./${icon}.png"></div><div class="ar" lang="ar" dir="rtl">${ar}</div><p>${say}</p><button class="gold" id="begin">Mulai latihan →</button>`);$('begin').onclick=quiz}
function quiz(){stage='quiz';let [q,opts,correct,why]=lessons[current][6][step];show(`<div class="eyebrow">LATIHAN ${step+1} / 2</div><h2>${lessons[current][0]}</h2><p>${q}</p>${opts.map((a,i)=>`<button class="answer" data-index="${i}" dir="auto">${a}</button>`).join('')}<p id="feedback" class="note" role="status"></p><button class="gold" id="next" hidden>Lanjut →</button>`);content.querySelectorAll('.answer').forEach((b,i)=>b.onclick=()=>{b.disabled=true;if(i===correct){content.querySelectorAll('.answer').forEach(b=>b.disabled=true);$('feedback').textContent='Benar! '+why;$('next').hidden=false;$('next').focus()}else{$('feedback').textContent='Belum tepat. '+why+' Coba pilih lagi.'}});$('next').onclick=()=>{if(++step<2)quiz();else finish()}}
function finish(){const fresh=!done.has(current);done.add(current);save();draw();const unlocked=fresh?needs.indexOf(done.size):-1;stage='reward';show(`<div class="win"><div class="eyebrow">✦ MISI SELESAI</div><h2>${lessons[current][0]}</h2><p>${fresh?'Kamu mendapatkan 50 XP.':'Latihan ulang selesai.'} Totalmu ${done.size*50} XP.</p>${unlocked>0?`<img class="skinImg" src="./hero${unlocked}.png" alt=""><p>Skin baru terbuka — <strong>${skins[unlocked]}</strong></p><button class="gold" id="wear">Pakai skin baru</button>`:''}<button class="secondary" id="return">Kembali ke desa</button></div>`);if($('wear'))$('wear').onclick=()=>{equipped=unlocked;save();draw();world()};$('return').onclick=world}
const stations=[10,26,42,58,74,90];
function nearest(){return stations.reduce((a,v,i)=>Math.abs(stations[a]-pos)<=Math.abs(v-pos)?a:i,0)}
function move(to){pos=Math.max(5,Math.min(95,to));$('player').style.left=pos+'%';let i=nearest();$('enter').textContent='Mulai misi · '+lessons[i][0]}
function world(){stage='map';show(`<div class="eyebrow">DUNIA 01</div><h2>Desa Alif</h2><p>Gunakan panah untuk berjalan atau pilih pos misi di peta.</p><div class="map">${stations.map((x,i)=>`<button class="marker" style="left:${x}%" data-stop="${i}" aria-label="Pos ${i+1}, ${lessons[i][0]}">${i+1}</button>`).join('')}<img id="player" class="player" alt="Karaktermu" src="./hero${equipped}.png"></div><div class="controls"><button class="secondary" id="left">← Kiri</button><button class="secondary" id="right">Kanan →</button></div><button class="gold" id="enter"></button>`);move(pos);$('left').onclick=()=>move(pos-8);$('right').onclick=()=>move(pos+8);$('enter').onclick=()=>lesson(nearest());content.querySelectorAll('.marker').forEach(b=>b.onclick=()=>move(stations[Number(b.dataset.stop)]))}
document.addEventListener('keydown',e=>{if(stage==='map'&&modal.open&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(pos+(e.key==='ArrowRight'?8:-8))}});
$('explore').onclick=world;route();
