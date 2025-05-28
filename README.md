# AniMessnager 

A modern web application built with Nuxt 3, featuring a complete authentication system, user management, and SurrealDB integration.

## Technologies

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **Backend**: Nuxt API routes, SurrealDB
- **Authentication**: Custom token-based auth with secure HTTP-only cookies
- **State Management**: Pinia with persistence

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) package manager
- [SurrealDB](https://surrealdb.com/) (for database)

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

---

### 🖥️ Step 1: Launch the Virtual Machine

Make sure you are working inside your virtual machine or development environment.

---

### 🔧 Step 2: Make the Setup Script Executable

```bash
chmod +x ./setup.sh
```

---

### ▶️ Step 3: Run the Setup Script

```bash
./setup.sh
```

---

### 🔄 Step 4: Reload the Shell Configuration

```bash
source .bashrc
```

---

### 🛠️ Step 5: Create the Environment File

Create a `.env` file in the root of the project:

```bash
touch .env
```

Then add the following line (replace `<cloud>` with your SurrealDB cloud URL):

```env
SURREAL_URL=<cloud>
```

---

### 📦 Step 6: Install Dependencies

Install the project dependencies using `pnpm`:

```bash
pnpm install
```

---

### 🧪 Step 7: Start the Development Server

Run the development server:

```bash
pnpm run dev
```

---

### 🌐 Open in Browser

Once the server is running, open:

```
http://localhost:3000
```

---

## ✅ You're Ready!

Your development environment is now set up. You're ready to start building and exploring the messenger app!
