// register.js
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Inisialisasi EmailJS (Ganti dengan Public Key Anda)

import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Fungsi Baru: Cek Otorisasi ---
async function isAuthorized(email) {
    // 1. Cek apakah sudah ada user di database
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    // Jika belum ada user sama sekali, berarti ini pendaftar pertama (Superadmin)
    if (snapshot.empty) {
        console.log("Pendaftar pertama terdeteksi. Diizinkan sebagai Superadmin.");
        return true;
    }

    // 2. Jika sudah ada user, cek apakah email ini ada di whitelist (koleksi 'whitelist')
    const whitelistRef = collection(db, "whitelist");
    const q = query(whitelistRef, where("email", "==", email));
    const whitelistSnapshot = await getDocs(q);

    return !whitelistSnapshot.empty;
}

// --- Update Fungsi Tombol Kirim OTP ---
document.getElementById('btn-send-otp').onclick = async () => {
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    if (!email) return alert("Email wajib diisi!");

    // Tampilkan loading (opsional)
    document.getElementById('btn-send-otp').innerText = "Checking...";

    // JALANKAN CEK OTORISASI
    const allowed = await isAuthorized(email);
    
    if (!allowed) {
        document.getElementById('btn-send-otp').innerText = "Kirim Kode OTP";
        return alert("Akses Ditolak: Email Anda tidak terdaftar. Hubungi Superadmin untuk akses.");
    }

    // --- Lanjutkan ke pengiriman EmailJS jika diizinkan ---
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    const templateParams = { to_email: email, otp_code: generatedOTP };

    try {
        await emailjs.send('service_vp9gwc6', 'template_s7lk1uj', templateParams, 'SUhLGSNSFAi3j6-nH');
        alert("Kode OTP telah dikirim ke email Anda.");
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    } catch (error) {
        alert("Gagal kirim OTP.");
    } finally {
        document.getElementById('btn-send-otp').innerText = "Kirim Kode OTP";
    }
};













emailjs.init("SUhLGSNSFAi3j6-nH");

let generatedOTP;
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

// --- 1. Fungsi Kirim OTP ---
document.getElementById('btn-send-otp').onclick = async () => {
    const email = document.getElementById('reg-email').value;
    
    if (!email) return alert("Email wajib diisi!");

    // Generate 6 digit angka acak
    generatedOTP = Math.floor(100000 + Math.random() * 900000);

    const templateParams = {
        to_email: email,
        otp_code: generatedOTP
    };

try {
    // Menambahkan parameter ke-4 (Public Key) langsung di fungsi send
    const response = await emailjs.send(
        'service_vp9gwc6', 
        'template_s7lk1uj', 
        templateParams, 
        'SUhLGSNSFAi3j6-nH' // <--- Public Key kamu
    );

    console.log("SUCCESS!", response.status, response.text);
    alert("Kode OTP telah dikirim ke email Anda.");
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
} catch (error) {
    // Jika Error 400, pesan spesifik dari EmailJS akan muncul di sini
    console.error("Gagal kirim email:", error);
    alert("Gagal kirim OTP: " + (error.text || "Terjadi kesalahan pada data"));
}
};

// --- 2. Fungsi Verifikasi & Registrasi ---
document.getElementById('btn-verify').onclick = async () => {
    const inputOTP = document.getElementById('otp-input').value;

    if (inputOTP == generatedOTP) {
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const username = document.getElementById('reg-username').value;

        try {
            // A. Buat user di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // B. Simpan metadata tambahan (Username) di Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                role: "admin",
                createdAt: new Date()
            });

            alert("Akun Admin berhasil dibuat!");
            window.location.href = "login.html";
        } catch (error) {
            alert("Gagal daftar: " + error.message);
        }
    } else {
        alert("Kode OTP salah atau tidak sesuai!");
    }
};

document.getElementById('btn-back').onclick = () => {
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
};