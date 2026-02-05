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
const eventContainer = document.getElementById("event-container");

const q = query(collection(db, "events"));

onSnapshot(q, (snapshot) => {
  eventContainer.innerHTML = ""; // Bersihkan container sebelum render ulang

  // app.js (Bagian render kartu)
  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id; // Ambil ID unik dokumen

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

    <p class="event-title">${data.eventName}</p>
    <p class="start-date">Tanggal Mulai : ${data.startDate}</P>
    <p class="start-time">Waktu Mulai : ${data.startTime}</P>
    <p class="end-date">Tanggal Selesai : ${data.endDate}</P>
    <p class="end-time">Tanggal Selesai : ${data.endTime}</P>



    <div class="card-meta">
      <span class="detail-hint">TAB FOR DETAILS</span>
    </div>
  </div>
`;


    // Fungsi klik untuk buka modal
    card.onclick = () => showModal(data);
    eventContainer.appendChild(card);
  });








  // Fungsi menampilkan Modal
const modal = document.getElementById("details-modal");
const modalBody = document.getElementById("modal-body");
const modalImage = document.querySelector(".modal-image");

function showModal(data) {
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

    <h4 class="section-title">Rincian Acara Terjadwal</h4>

    <table class="detail-table">
      <tr><td>Nama Acara</td><td>${data.eventName}</td></tr>
      <tr><td>Jenis Acara</td><td>${data.eventType}</td></tr>
      <tr><td>Tanggal Mulai</td><td>${data.startDate}</td></tr>
      <tr><td>Waktu Mulai</td><td>${data.startTime}</td></tr>
      <tr><td>Tanggal Selesai</td><td>${data.endDate}</td></tr>
      <tr><td>Waktu Selesai</td><td>${data.endTime}</td></tr>
    </table>

    <div class="modal-boxes">
      <div class="info-box">
        <span>Lantai</span>
        <strong>${data.floor}</strong>
      </div>
      <div class="info-box">
        <span>Kapasitas</span>
        <strong>${data.capacity} Guest</strong>
      </div>
    </div>

    <div class="info-details">
      <span>Deskripsi</span>
      <p>${data.description}</p>
    </div>
  `;

  modal.style.display = "block";
}

// Tutup modal
document.querySelector(".close-button").onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e === modal) modal.style.display = "none";
};

});









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