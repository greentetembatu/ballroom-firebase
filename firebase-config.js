// firebase-config.js

// Kita mengimpor modul Firebase dari CDN (online) agar tidak perlu install apa pun
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; 

// Tambahkan ini
// Ganti isinya dengan data dari Project Settings Firebase Anda sendiri
const firebaseConfig = {
  apiKey: "AIzaSyCoSkemX2mhCE6smoJKkEt5HXPaC06Kmtw",
  authDomain: "jakarta-55781.firebaseapp.com",
  projectId: "jakarta-55781",
  storageBucket: "jakarta-55781.firebasestorage.app",
  messagingSenderId: "961323566087",
  appId: "1:961323566087:web:d59d62eff3c820d3b8d6a2",
  measurementId: "G-VXJESYSQMD"
};

// Inisialisasi Firebase
//const app = initializeApp(firebaseConfig);

// Hubungkan ke layanan yang kita butuhkan
//const db = getFirestore(app); // Untuk database (nama ballroom, acara, dll)
//const storage = getStorage(app); // Untuk upload foto nantinya

// Kita export 'db' agar bisa dipakai di app.js dan admin.js secara global
//export { db, storage };





const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inisialisasi Auth

export { db, auth }; // Export auth agar bisa dipakai secara global


