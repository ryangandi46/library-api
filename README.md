# 📚 Library Management REST API  
### Technical Test – Junior Backend Developer  
### Summit Global Teknologi

API ini adalah implementasi lengkap dari **Technical Test Junior Backend Developer – Summit Global Teknologi**, dibangun menggunakan **Node.js (Express.js)** dan **PostgreSQL**.  
Fungsi utama API:

- Manajemen Buku (Books)
- Manajemen Anggota (Members)
- Peminjaman & Pengembalian Buku (Borrowings)
- Validasi data, pagination, filtering, dan transaction handling

Semua aturan (rules) sudah sesuai dengan dokumen test.  
Database terdiri dari 3 tabel: **books, members, borrowings**.

---

# 🚀 1. Tech Stack

- Node.js 18+
- Express.js
- PostgreSQL
- pg (PostgreSQL client)
- Joi (validation)
- dotenv
- nodemon (dev)

---

# 📁 2. Project Structure

```bash
src/
├── config/
│   └── database.js
├── controllers/
│   ├── bookController.js
│   ├── memberController.js
│   └── borrowingController.js
├── models/
│   ├── book.js
│   ├── member.js
│   └── borrowing.js
├── services/
│   ├── bookService.js
│   ├── memberService.js
│   └── borrowingService.js
├── routes/
│   ├── bookRoutes.js
│   ├── memberRoutes.js
│   └── borrowingRoutes.js
└── app.js


.env.example
README.md
package.json
```

---

# 🔧 3. Installation & Setup

## 3.1. Install Dependencies

```bash
npm install
```

## 3.2. Setup Environment Variables  
Buat file `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=library_db
```

---

# 🗄️ 4. Database Setup

## 4.1. Create Database

```sql
CREATE DATABASE library_db;
\c library_db;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 4.2. Apply Schema

```bash
psql -U postgres -d library_db -f sql/schema.sql
```

## 4.3. Insert Sample Data

```bash
psql -U postgres -d library_db -f sql/sample_data.sql
```

---

# ▶️ 5. Run the Application

## Development:

```bash
npm run dev
```

## Production:

```bash
npm start
```

Base URL:

```text
http://localhost:3000
```

---

# 📚 6. API Documentation

Semua response menggunakan format JSON.

---

## 6.1. GET /api/books  

### 📌 Deskripsi  
Mengambil daftar buku + pagination + filtering.

### 🔗 Endpoint  
```http
GET /api/books
```

### 🔍 Query Params

| Param   | Type    | Required | Default | Keterangan                    |
|---------|---------|----------|---------|--------------------------------|
| title   | string  | no       | -       | Filter judul (contains)        |
| author  | string  | no       | -       | Filter penulis                 |
| page    | integer | no       | 1       | Halaman                        |
| limit   | integer | no       | 10      | Jumlah per halaman             |

### 📥 Contoh Request

```bash
curl "http://localhost:3000/api/books?page=1&limit=5&title=the"
```

### 📤 Response 200

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "published_year": 1925,
      "stock": 5,
      "isbn": "9780743273565",
      "available": true
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 5,
    "totalPages": 2
  }
}
```

---

## 6.2. POST /api/members  

### 📌 Deskripsi  
Registrasi anggota baru.

### 🔗 Endpoint  
```http
POST /api/members
```

### 📥 Body

```json
{
  "name": "Ryan Septian",
  "email": "ryan@example.com",
  "phone": "081234567890",
  "address": "Bandung"
}
```

### 📤 Response 201

```json
{
  "id": "uuid",
  "name": "Ryan Septian",
  "email": "ryan@example.com",
  "phone": "081234567890",
  "address": "Bandung",
  "created_at": "...",
  "updated_at": "..."
}
```

### ❌ Error Responses  

| Code | Message                    |
|------|-----------------------------|
| 400  | invalid input payload       |
| 409  | Email already registered    |

---

## 6.3. POST /api/borrowings  

### 📌 Deskripsi  
Proses peminjaman buku oleh member.

### 🔗 Endpoint  
```http
POST /api/borrowings
```

### 📥 Body

```json
{
  "book_id": "uuid-book",
  "member_id": "uuid-member"
}
```

### ✔️ Business Rules

- Buku harus **ada**.
- Member harus **ada**.
- Stok buku harus **> 0**.
- Member maksimal memiliki **3 pinjaman aktif**.
- Proses menggunakan **transaction**.
- Stok buku berkurang `stock - 1`.
- Status awal: `BORROWED`.

### 📤 Response 201

```json
{
  "id": "uuid-peminjaman",
  "book_id": "uuid-book",
  "member_id": "uuid-member",
  "borrow_date": "2025-11-25",
  "return_date": null,
  "status": "BORROWED"
}
```

### ❌ Error Responses

| Code | Message                          |
|------|----------------------------------|
| 400  | Book out of stock                |
| 400  | Member already has 3 borrowings  |
| 404  | Book not found                   |
| 404  | Member not found                 |

---

## 6.4. PUT /api/borrowings/:id/return  

### 📌 Deskripsi  
Mengembalikan buku yang dipinjam.

### 🔗 Endpoint  
```http
PUT /api/borrowings/:id/return
```

### ✔️ Business Rules

- Borrowing harus **ada**.
- Jika sudah dikembalikan → error.
- Menggunakan **transaction**.
- Stok buku bertambah `stock + 1`.
- Status berubah menjadi `RETURNED`.
- `return_date` = tanggal hari ini.

### 📤 Response 200

```json
{
  "id": "uuid",
  "book_id": "uuid",
  "member_id": "uuid",
  "borrow_date": "2025-11-20",
  "return_date": "2025-11-25",
  "status": "RETURNED"
}
```

### ❌ Error Responses

| Code | Message                     |
|------|-----------------------------|
| 404  | Borrowing not found         |
| 400  | Borrowing already returned  |

---

## 6.5. GET /api/members/:id/borrowings  

### 📌 Deskripsi  
Mengambil riwayat peminjaman member lengkap dengan detail buku.

### 🔗 Endpoint  
```http
GET /api/members/:id/borrowings
```

### 🔍 Query Params  

- `status` = BORROWED / RETURNED
- Pagination (`page`, `limit`)

### 📤 Response 200

```json
{
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "member_id": "uuid",
      "borrow_date": "2025-11-20",
      "return_date": null,
      "status": "BORROWED",
      "book": {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### ❌ Error Responses

| Code | Message           |
|------|-------------------|
| 404  | Member not found  |

---

# ❗ 7. Error Handling Format

Semua error mengikuti format:

```json
{
  "message": "deskripsi error"
}
```

---

# 🧪 8. Manual Testing (curl)

### Create member:
```bash
curl -X POST http://localhost:3000/api/members   -H "Content-Type: application/json"   -d '{"name":"Ryan","email":"tes@example.com","phone":"0812","address":"Bandung"}'
```

### Borrow a book:
```bash
curl -X POST http://localhost:3000/api/borrowings   -H "Content-Type: application/json"   -d '{"book_id":"UUID","member_id":"UUID"}'
```

---

# 🧬 9. Git Commands

### Init project

```bash
git init
git add .
git commit -m "feat: initial commit library api"
```

### Add remote

```bash
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

---

# 📌 10. Notes

- Semua business logic ada di **service layer**.
- Semua aturan teknis (max 3 borrowings, stock check, transaction) sudah diterapkan.
- README ini siap dilampirkan sebagai jawaban technical test.
