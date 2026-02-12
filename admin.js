// 1. IMPORT & AUTH
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, addDoc, onSnapshot, query, deleteDoc, updateDoc, 
    doc, setDoc, getDoc, getDocs // TAMBAHKAN getDocs DI SINI
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Cek Login
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
});

// Logout
document.getElementById('btnLogout').onclick = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        try {
            await signOut(auth);
            window.location.href = "login.html"; 
        } catch (error) {
            alert("Gagal logout: " + error.message);
        }
    }
};

// 2. DEKLARASI ELEMEN DOM
const modal = document.getElementById("eventModal");
const btnOpenAddModal = document.getElementById("btnOpenAddModal");
const closeModal = document.querySelector(".close-modal");
const btnCancelModal = document.getElementById("btnCancelModal");
const modalTitle = document.getElementById("modalTitle");
const eventForm = document.getElementById('event-form');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submitBtn');
const imageUrlInput = document.getElementById('imageUrlInput');
const previewContainer = document.getElementById('imagePreviewContainer');
const previewTarget = document.getElementById('imagePreviewTarget');

// 3. FUNGSI PREVIEW GAMBAR
function updateImagePreview(url) {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const tempImg = new Image();
        tempImg.onload = () => {
            previewTarget.src = url;
            previewContainer.style.display = "flex";
            previewTarget.style.opacity = "1";
        };
        tempImg.onerror = () => {
            previewTarget.src = "https://via.placeholder.com/400x200?text=Gambar+Tidak+Dapat+Dimuat";
            previewContainer.style.display = "flex";
        };
        tempImg.src = url;
    } else {
        previewContainer.style.display = "none";
        previewTarget.src = "";
    }
}

imageUrlInput.addEventListener('input', (e) => updateImagePreview(e.target.value));

// 4. FUNGSI EDIT & MODAL
function isiFormUntukEdit(id, data) {
    editIdInput.value = id;
    document.getElementById('roomName').value = data.roomName || "";
    document.getElementById('floor').value = data.floor || "";
    document.getElementById('eventName').value = data.eventName || "";
    document.getElementById('eventType').value = data.eventType || "";
    document.getElementById('capacity').value = data.capacity || "";
    document.getElementById('description').value = data.description || "";
    document.getElementById('startDate').value = data.startDate || "";
    document.getElementById('endDate').value = data.endDate || "";
    document.getElementById('startTime').value = data.startTime || "";
    document.getElementById('endTime').value = data.endTime || "";
    document.getElementById('status').value = data.status || "Available";
    
    const url = data.imageUrl || "";
    imageUrlInput.value = url;
    updateImagePreview(url); 

    submitBtn.innerText = "Update Data";
    openEventModal("edit");
}

function openEventModal(mode = "add") {
    modal.style.display = "block";
    modalTitle.innerText = mode === "add" ? "Input Data Acara Baru" : "Edit Data Acara";
    if (mode === "add") resetForm();
}

function closeEventModal() {
    modal.style.display = "none";
    resetForm();
}

function resetForm() {
    editIdInput.value = "";
    submitBtn.innerText = "Simpan Data";
    eventForm.reset();
    updateImagePreview(""); 
}

btnOpenAddModal.onclick = () => openEventModal("add");
closeModal.onclick = closeEventModal;
btnCancelModal.onclick = closeEventModal;
window.onclick = (e) => { if (e.target == modal) closeEventModal(); };

// 5. SIMPAN / UPDATE KE FIREBASE
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
            await addDoc(collection(db, "events"), data);
            alert("✅ Berhasil menambah acara!");
        } else {
            await updateDoc(doc(db, "events", editIdInput.value), data);
            alert("✅ Berhasil memperbarui acara!");
        }
        closeEventModal();
    } catch (error) {
        alert("Gagal: " + error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

// 6. LOAD DAFTAR ACARA (REALTIME)
const adminList = document.getElementById('admin-event-list');
onSnapshot(query(collection(db, "events")), (snapshot) => {
    adminList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;
        const imgUrl = item.imageUrl || "https://via.placeholder.com/80x60?text=No+Photo";
        const statusClass = item.status === "Available" ? "status-available" : "status-booked";

        const row = document.createElement('div');
        row.className = 'admin-item';
        row.innerHTML = `
            <img src="${imgUrl}" alt="Room" class="event-preview-img">
            <div class="item-info">
                <div>📍 ${item.roomName} (Lantai ${item.floor})</div>
                <div style="font-weight: bold;">${item.eventName}</div>
                <div class="status-badge ${statusClass}">${item.status}</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-edit-action" data-id="${id}">Edit</button>
                <button class="btn-delete-action" data-id="${id}">Hapus</button>
            </div>
        `;
        adminList.appendChild(row);
    });

    // Event Hapus & Edit
    document.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.onclick = async (e) => {
            if (confirm("Hapus acara ini?")) {
                await deleteDoc(doc(db, "events", e.target.dataset.id));
            }
        };
    });

    document.querySelectorAll('.btn-edit-action').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            const data = snapshot.docs.find(d => d.id === id).data();
            isiFormUntukEdit(id, data);
        };
    });
});

// 7. UPDATE PROFIL HOTEL
document.getElementById('btnUpdateProfile').onclick = async () => {
    const nameVal = document.getElementById('newHotelName').value;
    const jargonVal = document.getElementById('newHotelJargon').value;
    if (!nameVal || !jargonVal) return alert("Data tidak boleh kosong!");

    try {
        await setDoc(doc(db, "settings", "hotelProfile"), {
            hotelName: nameVal,
            hotelJargon: jargonVal,
            lastUpdated: new Date()
        });
        alert("✅ Profil diperbarui!");
    } catch (error) {
        alert("Gagal update: " + error.message);
    }
};

async function loadHotelProfile() {
    const snap = await getDoc(doc(db, "settings", "hotelProfile"));
    if (snap.exists()) {
        document.getElementById('newHotelName').value = snap.data().hotelName;
        document.getElementById('newHotelJargon').value = snap.data().hotelJargon;
    }
}
loadHotelProfile();

// 8. DOWNLOAD DATA (FIXED)
document.getElementById('autoDownloadToggle').addEventListener('change', (e) => {
    const statusMsg = document.getElementById('statusMessage');
    statusMsg.innerText = e.target.checked ? "Auto download aktif" : "Auto download nonaktif";
    statusMsg.style.color = e.target.checked ? "#4ade80" : "#ef4444";
});

document.getElementById('btnDownloadNow').onclick = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        if (querySnapshot.empty) return alert("Tidak ada data untuk diunduh.");

        // 1. Definisikan Header
        const headers = ["Nama Ballroom", "Nama Event","Tipe Event", "Lantai", "Kapasitas","Tanggal Mulai", "Jam Mulai", "Tanggal Selesai","Jam Selesai", "Status"];
        
        // 2. Gunakan pemisah Titik Koma (;) agar Excel otomatis membagi kolom
        const separator = ";";
        
        // Baris khusus agar Excel langsung tahu pemisahnya adalah titik koma
        let csvContent = `sep=${separator}\n`; 
        
        // Tambahkan Header
        csvContent += headers.join(separator) + "\n";

        // 3. Masukkan Data Acara
        querySnapshot.forEach(d => {
            const val = d.data();
            
            // Bersihkan data agar tidak merusak format (hapus titik koma dan kutip jika ada di teks)
            const clean = (text) => {
                return `"${(text || "").toString().replace(/"/g, '""').replace(/;/g, ' ')}"`;
            };

            const row = [
                clean(val.roomName),
                clean(val.eventName),
                clean(val.eventType),
                clean(val.floor),
                clean(val.capacity),
                clean(val.startDate),
                clean(val.startTime),
                clean(val.endDate),
                clean(val.endTime),
                clean(val.status)
            ];

            csvContent += row.join(separator) + "\n";
        });

        // 4. Tambahkan BOM agar karakter terbaca dengan benar (UTF-8)
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // 5. Eksekusi Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
        
        a.href = url;
        a.download = `Laporan_Hotel_Management_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download Error:", error);
        alert("Gagal merapikan kolom: " + error.message);
    }
};








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


















onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user yang login, tendang ke halaman login
        window.location.href = "login.html";
    } else {
        console.log("Welcome, Admin:", user.email);
    }
});


























// --- MONITOR DAFTAR ADMIN & STATUS ---
const adminAuthList = document.getElementById('admin-auth-list');

function monitorAdminStatus() {
    // 1. Ambil data whitelist secara realtime
    onSnapshot(collection(db, "whitelist"), async (snapshot) => {
        adminAuthList.innerHTML = ""; // Bersihkan list awal

        // Ambil semua data user terdaftar untuk mencocokkan nama & status aktif
        const usersSnapshot = await getDocs(collection(db, "users"));
        const registeredUsers = {};
        usersSnapshot.forEach(u => {
            registeredUsers[u.data().email.toLowerCase()] = u.data();
        });

        snapshot.forEach((docSnap) => {
            const authData = docSnap.data();
            const id = docSnap.id;
            const email = authData.email.toLowerCase();
            
            // Cek apakah email ini sudah ada di koleksi users
            const profile = registeredUsers[email];
            
            const nama = profile ? profile.fullName || profile.displayName : "---";
            const isRegistered = !!profile;
            const statusText = isRegistered ? "✅ Terdaftar" : "⏳ Menunggu Registrasi";
            const statusClass = isRegistered ? "status-active-chip" : "status-pending-chip";

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
            tr.innerHTML = `
                <td style="padding: 12px;">${nama}</td>
                <td style="padding: 12px;">${email}</td>
                <td style="padding: 12px;">
                    <span class="${statusClass}" style="padding: 4px 8px; border-radius: 4px; font-size: 11px; background: ${isRegistered ? '#14532d' : '#451a03'}; color: ${isRegistered ? '#4ade80' : '#fbbf24'};">
                        ${statusText}
                    </span>
                </td>
                <td style="padding: 12px;">
                    <button onclick="removeAuth('${id}', '${email}')" style="background: none; border: none; color: #ef4444; cursor: pointer;">Hapus</button>
                </td>
            `;
            adminAuthList.appendChild(tr);
        });
    });
}

// Fungsi untuk menghapus izin akses
window.removeAuth = async (id, email) => {
    if (confirm(`Cabut izin akses untuk ${email}?`)) {
        try {
            await deleteDoc(doc(db, "whitelist", id));
            alert("Izin akses dicabut.");
        } catch (error) {
            alert("Gagal: " + error.message);
        }
    }
};

// Panggil fungsi monitor saat User terverifikasi sebagai Superadmin
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().role === "superadmin") {
            const section = document.getElementById('superadmin-section');
            if (section) section.style.display = "block";
            monitorAdminStatus(); // JALANKAN MONITORING DI SINI
        }
    } else {
        window.location.href = "login.html";
    }
});
