import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  query,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";




// 1. Fungsi Jam Digital
function updateClock() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("clock").innerText = now.toLocaleTimeString("id-ID");
  document.getElementById("date").innerText = now.toLocaleDateString(
    "id-ID",
    options,
  );
}
setInterval(updateClock, 1000);








// 2. Ambil Data dari Firestore secara Real-time
let allEventsData = []; // Menyimpan data untuk navigasi
let currentIndex = 0;
let autoModalTimer;
let slideInterval;
let scrollInterval;

const eventContainer = document.getElementById("event-container");
const modal = document.getElementById("details-modal");

// --- 7. AUTO FULLSCREEN (Klik di mana saja pertama kali untuk aktif) ---
document.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
}, { once: true });

// Ambil Data Real-time
const q = query(collection(db, "events"));

onSnapshot(q, (snapshot) => {
    eventContainer.innerHTML = "";
    allEventsData = []; // Reset array data

    snapshot.forEach((doc) => {
        const data = doc.data();
        allEventsData.push(data); // Simpan ke array untuk navigasi

        const card = document.createElement("div");
        card.className = "event-card";
card.innerHTML = `
  <div class="card-image">
    <img src="${data.imageUrl || "https://via.placeholder.com/400"}">
  </div>

  <div class="card-info">
    <span class="status-badge ${data.status.toLowerCase()}">
      ${data.status}
    </span>

    <h3>${data.roomName}</h3>
    <span>🟡  ${data.floor}</span>

    <p class="event-title">${data.eventType}</p>
    <p class="start-date">Tanggal Mulai : ${data.startDate}</P>
    <p class="start-time">Waktu Mulai : ${data.startTime}</P>
    <p class="end-date">Tanggal Selesai : ${data.endDate}</P>
    <p class="end-time">Tanggal Selesai : ${data.endTime}</P>



    <div class="card-meta">
      <span class="detail-hint">TAB FOR DETAILS</span>
    </div>
  </div>
`;

        card.onclick = () => {
            currentIndex = allEventsData.indexOf(data);
            showModal(data);
        };
        eventContainer.appendChild(card);
    });

    // --- 6. AUTO SCROLL KARTU NAIK TURUN ---
    startAutoScroll();

    // --- 3. AUTO OPEN MODAL DALAM 2 MENIT (120000 ms) ---
    clearTimeout(autoModalTimer);
    autoModalTimer = setTimeout(() => {
        if (allEventsData.length > 0) showModal(allEventsData[0]);
    }, 10000); 
});




// Fungsi Menampilkan Modal
function showModal(data) {
    if (!data) return;
    
    const modalImage = document.querySelector(".modal-image");
    const modalBody = document.getElementById("modal-body");

// Tambahkan class animasi setiap kali ganti data
    modalBody.classList.remove("fade-anim");
    modalImage.classList.remove("fade-anim");
    
    // Trigger reflow agar animasi bisa diulang
    void modalBody.offsetWidth;

  modalImage.innerHTML = `
    <img 
      src="${data.imageUrl || "https://via.placeholder.com/600"}" 
      alt="${data.roomName || "Room Image"}"
    >
  `;
  modalBody.innerHTML = `
    <div class="modal-header">
      <h2>${data.roomName}</h2>
      <span class="modal-status ${data.status?.toLowerCase()}">
        ${data.status}
      </span>
    </div>

    <h4 class="section-title">Rincian Acara Terjadwal :</h4>

    <table class="detail-table">
<tr>
  <td>Nama Acara</td>
  <td class="colon">:</td>
  <td>${data.eventName}</td>
</tr>
<tr>
  <td>Jenis Acara</td>
  <td class="colon">:</td>
  <td>${data.eventType}</td>
</tr>
<tr>
  <td>Tanggal Mulai</td>
  <td class="colon">:</td>
  <td>${data.startDate}</td>
</tr>
<tr>
  <td>Waktu Mulai</td>
  <td class="colon">:</td>
  <td>${data.startTime}</td>
</tr>
<tr>
  <td>Tanggal Selesai</td>
  <td class="colon">:</td>
  <td>${data.endDate}</td>
</tr>
<tr>
  <td>Waktu Selesai</td>
  <td class="colon">:</td>
  <td>${data.endTime}</td>
</tr>
    </table>

    <div class="modal-boxes">
      <div class="info-box">
        <span>Lantai : </span>
        <strong>${data.floor}</strong>
      </div>
      <div class="info-box">
        <span>Kapasitas : </span>
        <strong>${data.capacity} Guest</strong>
      </div>
    </div>

    <div class="info-details">
      <span>Deskripsi : </span>
      <p>${data.description}</p>
    </div>
  `;

// Pasang kembali class animasi
    modalBody.classList.add("fade-anim");
    modalImage.classList.add("fade-anim");

  modal.style.display = "block";
    
    // --- 4. AUTO SLIDE MODAL (Pindah tiap 5 detik) ---
    startAutoSlide();
}

// --- 1. NAVIGASI KIRI KANAN ---
document.querySelector(".next-btn").onclick = (e) => {
    e.stopPropagation();
    changeSlide(1);
};
document.querySelector(".prev-btn").onclick = (e) => {
    e.stopPropagation();
    changeSlide(-1);
};

function changeSlide(direction) {
    currentIndex += direction;
    
    // --- 5. AUTO CLOSE JIKA KARTU HABIS ---
    if (currentIndex >= allEventsData.length || currentIndex < 0) {
        closeMyModal();
    } else {
        showModal(allEventsData[currentIndex]);
    }
}

function startAutoSlide() {
    clearInterval(slideInterval);
    
    // Reset Progress Bar
    const bar = document.getElementById("progress-bar");
    if (bar) {
        bar.style.transition = "none";
        bar.style.width = "0%";
        setTimeout(() => {
            bar.style.transition = "width 5s linear";
            bar.style.width = "100%";
        }, 50);
    }

    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); 
}
// --- 2. CLOSE KLIK DIMANA SAJA ---
window.onclick = (e) => {
    if (e.target == modal || e.target.classList.contains('close-button')) {
        closeMyModal();
    }
};

function closeMyModal() {
    modal.style.display = "none";
    clearInterval(slideInterval);
    currentIndex = 0; 
    
    // Mulai scroll lagi dari awal
    startAutoScroll(); 
}


// --- 6. LOGIKA AUTO SCROLL ---
function startAutoScroll() {
    clearInterval(scrollInterval);
    let direction = 1; 
    let frameCounter = 0; // Penghitung frame untuk mengatur kecepatan

    scrollInterval = setInterval(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        // 1. CEK JIKA MENYENTUH BATAS BAWAH
        if (scrollTop + clientHeight >= scrollHeight - 1) {
            if (direction === 1) {
                console.log("Sampai bawah, timer auto-open dimulai...");
                startAutoOpenLogic();
            }
            direction = -1; 
        }
        
        // 2. CEK JIKA MENYENTUH BATAS ATAS
        if (scrollTop <= 0) {
            direction = 1;
        }
        
        // LOGIKA KECEPATAN:
        // frameCounter % 3 artinya hanya bergerak setiap 3 kali interval.
        // Semakin besar angka 3, maka akan semakin LAMBAT.
        // Gunakan 2 jika ingin sedikit lebih cepat, gunakan 4 jika ingin sangat lambat.
        frameCounter++;
        if (frameCounter % 3 === 0) {
            window.scrollBy(0, direction * 1); 
        }

    }, 20); // Interval tetap rapat (20ms) agar transisi antar pixel tidak terlihat patah
}






// Deklarasi variabel timer di bagian atas script
let autoOpenTimer; 

function startAutoOpenLogic() {
    // Bersihkan timer lama jika ada agar tidak bentrok
    clearTimeout(autoOpenTimer);

    autoOpenTimer = setTimeout(() => {
        // Cek jika modal sedang TIDAK terbuka
        if (modal.style.display !== "block" && allEventsData.length > 0) {
            console.log("Triggering Auto Open...");
            currentIndex = 0; 
            showModal(allEventsData[currentIndex]);
            
            // Opsional: Berhentikan scroll saat modal terbuka agar tidak pusing
            clearInterval(scrollInterval); 
        }
    }, 10000); // 10 detik setelah sampai bawah
}











function hideAllScrollbars() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 1. Hilangkan visual batang scroll secara total */
        html::-webkit-scrollbar, 
        body::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
        }

        /* 2. Sembunyikan untuk Firefox & IE */
        html, body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }

        /* 3. KUNCI: Tetap izinkan scroll secara fungsional */
        html {
            overflow: -moz-scrollbars-none; /* Fix khusus Firefox lama */
            overflow-y: scroll !important;  /* WAJIB: agar JS bisa scroll */
            height: 100%;
        }

        body {
            overflow-y: auto !important;
            min-height: 100vh;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
}

hideAllScrollbars();
















import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadHotelProfile() {
    try {
        const docRef = doc(db, "settings", "hotelProfile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('hotel-name').innerText = data.hotelName;
            document.getElementById('hotel-jargon').innerText = data.hotelJargon;
        } else {
            console.log("Profil belum di-set di admin, menggunakan nama default HTML.");
        }
    } catch (error) {
        console.error("Gagal memuat profil:", error);
    }
}

// Jalankan fungsi saat halaman dibuka
loadHotelProfile();










