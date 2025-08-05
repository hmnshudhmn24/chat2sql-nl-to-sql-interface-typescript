# 💬 Chat2SQL: Natural Language to SQL Interface

Translate human questions into SQL queries securely with the help of OpenAI and TypeScript.

---

## 🔧 Features

- ✅ Natural language to SQL query generation using GPT
- 🔒 Role-based access control (`admin` / `user`)
- 🕵️ Query preview with editable SQL output
- 🧯 Safe SQL execution: only `SELECT` queries allowed

---

## 🧪 Tech Stack

- TypeScript
- Express.js
- PostgreSQL
- OpenAI API (GPT)
- dotenv
- CORS, BodyParser

---

## 🚀 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/chat2sql.git
   cd chat2sql
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file:

   ```bash
   OPENAI_API_KEY=your_openai_key
   DATABASE_URL=postgres://user:pass@localhost:5432/dbname
   PORT=3000
   ```

4. **Run the Server**
   ```bash
   npm start
   ```

---

## 🔐 Role-Based Access

Update users in `server.ts`:

```ts
const USERS: Record<string, 'admin' | 'user'> = {
  'admin@example.com': 'admin',
  'user@example.com': 'user',
};
```

---

## 🧠 Example Usage

**POST** `/api/nl-to-sql`

```json
{
  "email": "admin@example.com",
  "question": "What are the top 5 products by sales?"
}
```

**Response:**

```json
{
  "query": "SELECT name, sales FROM products ORDER BY sales DESC LIMIT 5;",
  "preview": [
    { "name": "Laptop", "sales": 1000 },
    { "name": "Monitor", "sales": 800 }
  ]
}
```

---

## ⚠️ Security Notes

- This server only executes **SELECT** queries for safety.
- Always validate GPT outputs before execution in production.

---

## 🧩 Future Improvements

- SQL syntax highlighting in the frontend
- Interactive query editor
- Advanced RBAC
- Rate limiting

---

## 📄 License

MIT License