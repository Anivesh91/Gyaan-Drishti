# 🎓 GYAAN DRISHTI
## (NO MONGODB VERSION — Seedha chalega!)

----

## ✅ Kya Chahiye
- Node.js (nodejs.org se download karo)
- Bas! MongoDB ki zarurat NAHI!

---

## 🚀 Kaise Chalaye

### Terminal 1 — Backend:
```
cd backend
npm install
npm run dev
```
✅ Dikhega: "Server: http://localhost:5000"
✅ Dikhega: "Database: JSON files (no MongoDB needed!)"

### Terminal 2 — Frontend:
```
cd frontend
npm install
npm start
```
✅ Browser mein http://localhost:3000 khulega

---

## 🔑 Pehli Baar Setup

1. http://localhost:3000/register par jao
2. **Admin** account banao (Role: Admin)
3. Admin se login karo
4. "Add User" se Teacher aur Students add karo
5. Teacher se login karke attendance mark karo
6. Student se login karke apna data dekho

---

## 💾 Data Kahan Jata Hai?

Data yahan store hota hai JSON files mein:
```
backend/src/data/
  ├── users.json        (sabke accounts)
  ├── attendance.json   (attendance records)
  ├── marks.json        (marks records)
  └── notifications.json (notifications)
```
Yeh files automatically ban jaati hain!
Delete karne par saara data jaayega.

---

## Features
✅ Login / Register / Password Reset
✅ Student: Attendance + Marks + Notifications + Profile
✅ Teacher: Mark Attendance + Enter Marks + Announcements
✅ Admin: Manage Users + Add User + Announcements
✅ Auto alerts jab attendance 75% se kam ho
✅ JWT Authentication + Role Based Access
