

// admin.js (Tambahkan di baris paling atas)
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Cek Status Login
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user yang login, lempar ke halaman login
        window.location.href = "login.html";
    }
});

// Fungsi Logout (Tambahkan tombol logout di HTML admin jika perlu)
// Contoh penggunaan: <button id="logout-btn">Logout</button>
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => {
            alert("Berhasil Logout");
            window.location.href = "login.html";
        });
    };
}






//import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user yang login, tendang ke halaman login
        window.location.href = "login.html";
    } else {
        console.log("Welcome, Admin:", user.email);
    }
});









//import { db } from './firebase-config.js';
import { 
collection, 
    addDoc, 
    onSnapshot, 
    query, 
    deleteDoc, 
    updateDoc,
    doc,        // Pastikan ini ada
    setDoc,     // Pastikan ini ada
    getDoc      // <--- TAMBAHKAN INI (Ini yang tadi kurang)
} 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const eventForm = document.getElementById('event-form');
const editIdInput = document.getElementById('edit-id');
const editIndicator = document.getElementById('edit-indicator');
const submitBtn = document.getElementById('submitBtn');

// --- FUNGSI 1: SIMPAN ATAU UPDATE ---
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    const data = {
        roomName: document.getElementById('roomName').value,
        floor: document.getElementById('floor').value,
        eventName: document.getElementById('eventName').value,
        eventType: document.getElementById('eventType').value,
        capacity: document.getElementById('capacity').value,
        description: document.getElementById('description').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        status: document.getElementById('status').value,
        imageUrl: document.getElementById('imageUrlInput').value,
        updatedAt: new Date()
    };

    try {
        if (editIdInput.value === "") {
            // MODE TAMBAH BARU
            await addDoc(collection(db, "events"), data);
            alert("Data berhasil ditambah!");
        } else {
            // MODE EDIT
            await updateDoc(doc(db, "events", editIdInput.value), data);
            alert("Data berhasil diperbarui!");
            resetForm();
        }
        eventForm.reset();
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan!");
    } finally {
        submitBtn.disabled = false;
    }
});

// --- FUNGSI 2: TAMPILKAN DAFTAR & LOGIKA TOMBOL ---
const adminList = document.getElementById('admin-event-list');
onSnapshot(query(collection(db, "events")), (snapshot) => {
    adminList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;

        const row = document.createElement('div');
        row.className = 'admin-item';
        row.innerHTML = `
            <div><strong>${item.roomName}</strong> - ${item.eventName}</div>
            <div>
                <button class="btn-edit" style="background: #4CAF50; color:white; border:none; padding:5px; cursor:pointer;" data-id="${id}">Edit</button>
                <button class="btn-delete" style="background: #ff4d4d; color:white; border:none; padding:5px; cursor:pointer;" data-id="${id}">Hapus</button>
            </div>
        `;
        adminList.appendChild(row);
    });

    // Event Listener Tombol Hapus
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = async (e) => {
            if (confirm("Hapus data ini?")) await deleteDoc(doc(db, "events", e.target.dataset.id));
        };
    });

    // Event Listener Tombol Edit
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            const docData = snapshot.docs.find(d => d.id === id).data();
            isiFormUntukEdit(id, docData);
        };
    });
});

// --- FUNGSI PEMBANTU ---
function isiFormUntukEdit(id, data) {
    editIdInput.value = id;
    document.getElementById('roomName').value = data.roomName;
    document.getElementById('floor').value = data.floor;
    document.getElementById('eventName').value = data.eventName;
    document.getElementById('eventType').value = data.eventType;
    document.getElementById('capacity').value = data.capacity;
    document.getElementById('description').value = data.description;
    document.getElementById('startDate').value = data.startDate;
    document.getElementById('endDate').value = data.endDate;
    document.getElementById('startTime').value = data.startTime;
    document.getElementById('endTime').value = data.endTime;
    document.getElementById('status').value = data.status;
    document.getElementById('imageUrlInput').value = data.imageUrl;

    editIndicator.style.display = "block";
    submitBtn.innerText = "Update Data";
    window.scrollTo(0, 0); // Scroll ke atas agar admin sadar sedang edit
}

function resetForm() {
    editIdInput.value = "";
    editIndicator.style.display = "none";
    submitBtn.innerText = "Simpan Data";
    eventForm.reset();
}

document.getElementById('cancel-edit').onclick = resetForm;













// 1. Pastikan signOut sudah di-import dari auth
//import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

//const auth = getAuth();

// 2. Logika Tombol Logout
document.getElementById('btnLogout').onclick = async () => {
    // Beri konfirmasi ke user
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    
    if (confirmLogout) {
        try {
            await signOut(auth);
            alert("Berhasil Logout.");
            // Arahkan kembali ke halaman login setelah logout
            window.location.href = "login.html"; 
        } catch (error) {
            console.error("Error saat logout:", error);
            alert("Gagal logout: " + error.message);
        }
    }
};




//import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Ambil data username dari Firestore berdasarkan UID
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            //document.getElementById('admin-name').innerText = "Selamat Datang, " + userSnap.data().username;
        }
    } else {
        window.location.href = "login.html";
    }
});









// admin.js

// 1. Pastikan setDoc sudah ada di import (cek bagian paling atas file!)
// import { ..., setDoc, doc } from "..."

document.getElementById('btnUpdateProfile').onclick = async () => {
    // Ambil elemen secara langsung saat tombol diklik
    const nameVal = document.getElementById('newHotelName').value;
    const jargonVal = document.getElementById('newHotelJargon').value;

    if (!nameVal || !jargonVal) {
        return alert("Nama dan Jargon tidak boleh kosong!");
    }

    try {
        console.log("Sedang mengupdate ke Firebase...");
        
        // Gunakan setDoc untuk menimpa dokumen 'hotelProfile'
        await setDoc(doc(db, "settings", "hotelProfile"), {
            hotelName: nameVal,
            hotelJargon: jargonVal,
            lastUpdated: new Date() // Menambahkan info waktu update
        });

        alert("✅ Berhasil! Nama hotel telah diperbarui.");
        
        // Opsional: Segarkan status di halaman
        if(document.getElementById('status-profil')) {
            document.getElementById('status-profil').innerText = "✅ Profil baru saja diperbarui.";
        }
        
    } catch (error) {
        console.error("Gagal Update:", error);
        // Jika muncul "Missing or insufficient permissions", berarti Rules bermasalah
        alert("Gagal update: " + error.message);
    }
};










async function loadCurrentProfile() {
    const nameInput = document.getElementById('newHotelName');
    const jargonInput = document.getElementById('newHotelJargon');
    const statusEl = document.getElementById('status-profil');

    try {
        const docRef = doc(db, "settings", "hotelProfile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Masukkan data ke dalam 'value' input agar bisa dilihat & diedit
            nameInput.value = data.hotelName || ""; 
            jargonInput.value = data.hotelJargon || "";
            
            if (statusEl) {
                statusEl.innerText = "✅ Data saat ini tersimpan di cloud.";
            }
        }
    } catch (error) {
        console.error("Gagal memuat profil:", error);
    }
}

// JALANKAN OTOMATIS











// --- BAGIAN SUPERADMIN: TAMBAH WHITELIST ---
const btnAddWhitelist = document.getElementById('btnAddWhitelist');

if (btnAddWhitelist) {
    btnAddWhitelist.onclick = async () => {
        const emailInput = document.getElementById('newAdminEmail');
        const feedback = document.getElementById('whitelist-feedback');
        const email = emailInput.value.trim().toLowerCase();

        if (!email) return alert("Masukkan email terlebih dahulu!");

        try {
            await addDoc(collection(db, "whitelist"), {
                email: email,
                addedBy: auth.currentUser.email,
                createdAt: new Date()
            });

            // Feedback sukses
            if (feedback) {
                feedback.style.color = "green";
                feedback.innerText = `✅ Sukses! ${email} sekarang dapat mendaftar.`;
                setTimeout(() => feedback.innerText = "", 5000);
            }
            
            alert("Berhasil mengizinkan: " + email);
            emailInput.value = ""; // Reset input

        } catch (error) {
            console.error("Error whitelist:", error);
            if (feedback) {
                feedback.style.color = "red";
                feedback.innerText = "❌ Gagal: " + error.message;
            }
        }
    };
}

// --- PROTEKSI HALAMAN & CEK ROLE SUPERADMIN ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                
                // Tampilkan panel hanya jika role-nya superadmin
                if (userData.role === "superadmin") {
                    const section = document.getElementById('superadmin-section');
                    if (section) section.style.display = "block";
                }
            }
        } catch (error) {
            console.error("Gagal verifikasi role:", error);
        }
    } else {
        window.location.href = "login.html";
    }
});