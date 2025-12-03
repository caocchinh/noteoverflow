<div align="center">
 <img src="https://github.com/caocchinh/noteoverflow/blob/master/.raw/logo-full-colorised.webp?raw=true" alt="NoteOverflow Logo" width="400"/>
  <p
    <strong>The open-source platform for Cambridge AS & A-Level students to annotate, organize, and master past papers questions.</strong>
  </p>
  <p style="margin-top: 10px;">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/github/stars/caocchinh/noteoverflow" alt="GitHub stars" />
    <img src="https://img.shields.io/github/forks/caocchinh/noteoverflow" alt="GitHub forks" />
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" />

  </p>
  
  <p>
    <img src="https://img.shields.io/github/issues/caocchinh/noteoverflow" alt="GitHub issues" />
    <img src="https://img.shields.io/github/issues-pr/caocchinh/noteoverflow" alt="GitHub pull requests" />
    <img src="https://img.shields.io/github/last-commit/caocchinh/noteoverflow" alt="Last commit" />
    <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintained" />
  </p>
</div>

---

## 📖 Introduction

**NoteOverflow** is a specialized platform built exclusively for **Cambridge International Examinations (CIE) AS and A-Level students**. Designed to streamline exam preparation, NoteOverflow helps students organize topical questions by subject, year, paper type, and season. With powerful PDF annotation tools and a collaborative Q&A system, it transforms how students prepare for their Cambridge exams by making past papers interactive and accessible.

## ✨ Features

NoteOverflow is packed with features tailored for Cambridge AS and A-Level exam preparation:

- **📚 Topical Question Browser**: Filter and browse past paper questions by curriculum (IGCSE/A-Level), subject, topic, year, paper type (P1, P2, P3, etc.), and season (Summer/Winter/Spring).
- **🎯 AS & A-Level Support**: Seamlessly switch between AS-Level and A-Level content with intelligent filtering for curriculum subdivisions.
- **🖍️ PDF Annotation Tools**: Annotate question papers and mark schemes directly in your browser using PDFTron WebViewer. Highlight, draw, and add comments to your practice papers.
- **💾 Save & Sync**: Your annotations are automatically saved and synced across devices, so you can pick up right where you left off.
- **🔖 Smart Bookmarking**: Create custom bookmark lists to organize questions by topic, difficulty, or revision priority.
- **✅ Progress Tracking**: Mark questions as completed and track your progress through past papers.
- **❓ Collaborative Q&A**: Ask questions and get help from fellow Cambridge students on challenging problems.
- **📤 Export with Annotations**: Download annotated PDFs with your notes for offline study or printing.
- **🔐 Secure Authentication**: Keep your study progress, annotations, and bookmarks private and secure.
- **📱 Responsive Design**: Study anywhere with a fully responsive interface optimized for desktop, tablet, and mobile devices.

## 📸 Screenshots

<div align="center">
  <!-- Add screenshots here -->
  <!-- <img src="path/to/screenshot1.png" alt="Dashboard" width="800" /> -->
  <br/>
  <!-- <img src="path/to/screenshot2.png" alt="Annotation Tool" width="800" /> -->
</div>

## 🛠️ Tech Stack

NoteOverflow is built using cutting-edge technologies to ensure scalability, performance, and developer experience:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://github.com/better-auth/better-auth)
- **PDF/Annotations**: [PDFTron WebViewer](https://www.pdftron.com/)
- **Deployment**: [Cloudflare Workers/Pages](https://workers.cloudflare.com/) via OpenNext

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/noteoverflow.git
    cd noteoverflow
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up environment variables**

    Copy the example environment file and update it with your credentials.

    ```bash
    cp .env.example .env.local
    ```

    > **Note**: You will need to configure your database connection and authentication providers in the `.env.local` file.

4.  **Generate Database Client**

    ```bash
    npm run db:generate
    ```

5.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by the NoteOverflow Team
</div>
