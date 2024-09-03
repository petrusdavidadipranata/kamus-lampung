/*jslint browser: true*/
'use strict';
var kamusJSON = {};
var kamus = {};

var hasilTerjemah = document.getElementById('hasilTerjemah');
var kataAsal = document.getElementById('kataAsal');
var bahasaAsal = document.getElementById('bahasaAsal');
var bahasaTujuan = document.getElementById('bahasaTujuan');

// Memeriksa apakah web storage tersedia
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

// Mengambil data JSON dari server
function fetchKamus() {
    var url = 'kamus.json'; // URL dari data JSON
    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            // Simpan Data
            localStorage.setItem('kamusJSON', JSON.stringify(data));
            kamus = data;
            hasilTerjemah.innerHTML = 'Siap menterjemahkan';
            hasilTerjemah.classList.remove("alert", "alert-info", "alert-warning");
            hasilTerjemah.classList.add("alert", "alert-success");
        })
        .catch(function (error) {
            hasilTerjemah.innerHTML = JSON.stringify(error);
            hasilTerjemah.classList.remove("alert", "alert-info", "alert-warning");
            hasilTerjemah.classList.add("alert", "alert-warning");
        });
}

// Mengambil data dari web storage
function fetchKamusDariLocalStorage(data) {
    kamus = JSON.parse(data);
    hasilTerjemah.innerHTML = 'Siap menterjemahkan (tersedia offline)';
    hasilTerjemah.classList.remove("alert", "alert-info", "alert-warning");
    hasilTerjemah.classList.add("alert", "alert-success");
}

if (storageAvailable('localStorage')) {
    if (localStorage.getItem('kamusJSON') === null) {
        // Pertama kali dipakai atau belum ada data tersimpan
        fetchKamus();
        console.log("Fetch dari API");
    } else {
        console.log("data: " + localStorage.getItem('kamusJSON'));
        fetchKamusDariLocalStorage(localStorage.getItem('kamusJSON'));
        console.log("Fetch dari Local Storage");
    }
} else {
    console.log("Data kamus belum tersedia..");
}

function terjemah(kataAsl, bhasaAsal, bhasaTujuan, strArray) {
    let kataA = bhasaAsal === "indonesia" ? "idkata" : "lpgkata";
    let kataT = bhasaTujuan === "indonesia" ? "idkata" : "lpgkata";

    let hasils = [];
    let j = 0;

    for (let i = 0; i < strArray.length; i++) {
        if (strArray[i][kataA] === kataAsl) { // test / match
            hasils[j] = [];
            hasils[j][0] = strArray[i][kataA];
            hasils[j][1] = strArray[i][kataT];
            hasils[j][2] = strArray[i]["lpgdialek"];
            hasils[j][3] = strArray[i]["lpgaksara"];
            j++;
            if (j == 3)
                break;
        }
    }

    return hasils;
}

function createNode(element) {
    return document.createElement(element); // Membuat tipe elemen yang dilewatkan melalui parameter
}

function append(parent, el) {
    return parent.appendChild(el); // Append parameter kedua ke yang pertama
}

function autoTranslate() {
    let kataAsals = kataAsal.value.toLowerCase();
    let asal = bahasaAsal.value;
    let tujuan = bahasaTujuan.value;

    if (!kataAsals.replace(/\s/g, '').length) {
        hasilTerjemah.innerHTML = 'Selamat menerjemahkan!';
        hasilTerjemah.classList.remove("alert", "alert-info", "alert-warning");
        hasilTerjemah.classList.add("alert", "alert-success");
    } else {
        let kataAl = kataAsals.split(/\s+/);
        if (kataAl[kataAl.length - 1] === '') {
            kataAl.pop();
        }

        hasilTerjemah.innerHTML = '';
        hasilTerjemah.classList.remove("alert", "alert-info", "alert-warning");

        let strong = createNode("strong");
        strong.innerHTML = kataAsal.value + ' (' + asal + ' to ' + tujuan + ') : <br/>';
        append(hasilTerjemah, strong);

        for (let i = 0; i < kataAl.length; i++) {
            let terjemahan = terjemah(kataAl[i], asal, tujuan, kamus);

            let pKata = createNode("p");
            pKata.innerHTML = kataAl[i] + ' (' + asal + ' to ' + tujuan + ') ';
            append(hasilTerjemah, createNode("hr"));
            append(hasilTerjemah, pKata);
            append(hasilTerjemah, createNode("hr"));

            if (tujuan === "indonesia") {
                terjemahan.map(function (dt) {
                    let p = createNode('p'),
                        span1 = createNode('span'),
                        span2 = createNode('span'),
                        span3 = createNode('span');
                    span1.innerHTML = dt[0] + " = ";
                    span2.innerHTML = dt[1];
                    span3.innerHTML = " (" + dt[1] + ")";
                    if (dt[2] != null) {
                        let sup = createNode('sup');
                        sup.innerHTML = dt[2];
                        append(span3, sup);
                    }
                    append(p, span1);
                    append(p, span2);
                    append(p, span3);
                    append(hasilTerjemah, p);
                });
            } else if (tujuan === "lampung") {
                terjemahan.map(function (dt) {
                    let p = createNode('p'),
                        span1 = createNode('span'),
                        span2 = createNode('span'),
                        span3 = createNode('span');
                    span1.innerHTML = dt[0];
                    span2.innerHTML = " (" + dt[0] + ")";
                    if (dt[2] != null) {
                        let sup = createNode('sup');
                        sup.innerHTML = dt[2];
                        append(span2, sup);
                    }
                    span3.innerHTML = " = " + dt[1];
                    append(p, span1);
                    append(p, span2);
                    append(p, span3);
                    append(hasilTerjemah, p);
                });
            }
        }

        hasilTerjemah.classList.add("alert", "alert-info");
    }
}

// Menambahkan event listener untuk form dan input
kataAsal.addEventListener('input', autoTranslate);
bahasaAsal.addEventListener('change', autoTranslate);
bahasaTujuan.addEventListener('change', autoTranslate);

function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', options);
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('tanggalWaktu').innerText = `${formattedDate} `;
    document.getElementById('jam').innerText = `${formattedTime}`
}

updateTime(); // Inisialisasi saat halaman pertama kali dimuat
setInterval(updateTime, 1000); // Perbarui setiap detik

document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById('backgroundMusic');

    // Function to handle playing the audio
    function playAudio() {
        var playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Audio started playing
            }).catch(error => {
                // Handle play error
                console.error('Audio play error: ', error);
            });
        }}})