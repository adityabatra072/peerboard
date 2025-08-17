# PeerBoard: Real-Time Collaborative Whiteboard

**PeerBoard** is a feature-rich, real-time collaborative whiteboard application built with a modern, full-stack JavaScript architecture. It provides an infinite canvas for users to brainstorm, draw, and share ideas live, with all data persisted in the cloud. The entire project is designed to run on a zero-cost, serverless-friendly infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo

**[Access the live application here](https://peerboard.vercel.app/dashboard)**

---

## ✨ Key Features

* **Real-Time Collaboration**: Live synchronization of drawings, text, and movements using WebSockets (Socket.IO).
* **Infinite Canvas**: A limitless workspace for brainstorming and ideation, powered by Konva.js.
* **Rich Toolset**: Includes tools for pen, pencil, highlighter, eraser, and text creation with full customization (color, size, font).
* **Authentication**: Secure user sign-in via Google and GitHub, managed by Supabase Auth.
* **Board Management**: Users can create new boards or join existing ones via a unique, shareable URL.
* **Data Persistence**: All board content is automatically saved to a PostgreSQL database, ensuring no work is lost on refresh.
* **Live Presence**: See who is currently active on the board and view their live cursors.
* **Modern UI/UX**: A clean, responsive, and visually appealing interface with light and dark themes, built with TailwindCSS.
* **Zero-Cost Deployment**: Architected to run entirely on the free tiers of modern cloud services.

---

## 🛠️ Tech Stack & Architecture

This project utilizes a modern, decoupled architecture with a React frontend, a Node.js backend for real-time communication, and Supabase for database and authentication services.

| Category      | Technology                                                                                                                                                                                                                                                                                          |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Konva.js](https://img.shields.io/badge/-Konva.js-2D97D2?style=for-the-badge) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white) ![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white) |
| **Database & Auth** | ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Deployment**| ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Railway](https://img.shields.io/badge/-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white) |

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* npm
* A free [Supabase](https://supabase.com) account
* A free [Vercel](https://vercel.com) account
* A free [Railway](https://railway.app) account

### Local Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/adityabatra072/peerboard.git
    cd peerboard
    ```

2.  **Set up Supabase:**
    * Create a new project on Supabase.
    * Go to the **SQL Editor** and run the SQL script found in [database_setup.sql](database_setup.sql) to create the `boards` table and its policies.
    * Go to **Project Settings > API** and find your **Project URL** and `anon` **public API Key**.

3.  **Configure Backend:**
    * Navigate to the `backend` directory:
        ```sh
        cd backend
        ```
    * Install dependencies:
        ```sh
        npm install
        ```
    * Start the backend server:
        ```sh
        node server.js
        ```
    * The backend will be running on `http://localhost:4000`.

4.  **Configure Frontend:**
    * Navigate to the `frontend` directory:
        ```sh
        cd ../frontend
        ```
    * Install dependencies:
        ```sh
        npm install
        ```
    * Create a `.env.local` file in the `frontend` directory and add your environment variables:
        ```env
        VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
        VITE_BACKEND_URL="http://localhost:4000"
        ```
    * Start the frontend development server:
        ```sh
        npm run dev
        ```
    * Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment

This project is designed for a seamless, zero-cost deployment.

1.  **Deploy the Backend to Railway:**
    * Push your repository to GitHub.
    * On Railway, create a new project and connect it to your GitHub repo.
    * Set the root directory to `./backend`. Railway will automatically detect the Node.js app and deploy it.
    * Once deployed, get the public URL provided by Railway.

2.  **Deploy the Frontend to Vercel:**
    * On Vercel, create a new project and connect it to the same GitHub repo.
    * Set the root directory to `frontend`. Vercel will auto-detect the Vite configuration.
    * In the project settings, add the following **Environment Variables**:
        * `VITE_SUPABASE_URL`: Your public Supabase project URL.
        * `VITE_SUPABASE_ANON_KEY`: Your public Supabase `anon` key.
        * `VITE_BACKEND_URL`: The public URL of your backend deployed on Railway.
    * Deploy the project.

---

## 📜 License

This project is distributed under the MIT License. See [License](LICENSE) for more information.

---

## 🤝 Contact

Aditya Batra - [aditya@singularitytech.in](mailto:aditya@singularitytech.in)
