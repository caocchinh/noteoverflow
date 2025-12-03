<div align="center">
 <img src="https://github.com/caocchinh/noteoverflow/blob/master/.raw/logo-full-colorised.webp?raw=true" alt="NoteOverflow Logo" width="400"/>
  <p
    <strong>The open-source platform for Cambridge AS & A-Level students to annotate, organize, and master past papers questions.</strong>
  </p>
  <p style="margin-top: 10px;">
    <a href="#-features">Features</a> •
    <a href="#️-tech-stack">Tech Stack</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Beta" />
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

**NoteOverflow** is a specialized platform built exclusively for **Cambridge International Examinations (CIE) AS and A-Level students**. Designed to streamline exam preparation, NoteOverflow helps students organize topical questions by subject, year, paper type, and season. With powerful PDF annotation tools and exportable PDFs, it transforms how students prepare for their Cambridge exams by making past papers interactive and accessible.

## ✨ Features

NoteOverflow is packed with features tailored for Cambridge AS and A-Level exam preparation:

- **📚 Topical Question Browser**: Filter and browse past paper questions by curriculum (IGCSE/A-Level), subject, topic, year, paper type (P1, P2, P3, etc.), and season (Summer/Winter/Spring).

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/filter.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-bottom: 10px; margin-top:-10px;border: 3px solid #0084ff;" />
<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/overal.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px; border: 3px solid #0084ff;margin-bottom:10px" />
<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/finish.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-bottom:10px; border: 3px solid #0084ff;" />

- **🖍️ PDF Annotation Tools**: Annotate question papers and mark schemes directly in your browser using PDFTron WebViewer. Highlight, draw, and add comments to your practice papers. Your annotations are automatically saved and synced across devices, so you can pick up right where you left off.

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/annotate.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-top:-10px;margin-bottom:10px; border: 3px solid #0084ff;" />

- **🧮 Built-in Desmos Calculator**: Access a fully-featured Desmos graphing calculator directly within the platform. Solve mathematical problems, plot functions, and visualize data without switching between applications—perfect for mathematics and science subjects.

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/desmos.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-top:-10px; margin-bottom:10px;border: 3px solid #0084ff;" />

- **🔗 Smart Sharing & QR Codes**: Share individual questions and custom search filters with classmates using shareable links or QR codes. Scan QR codes to instantly access shared questions and filters.

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/qr.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-top:-10px;margin-bottom:10px; border: 3px solid #0084ff;" />

- **🔍 Past Paper Search**: Quickly find specific past papers using the intelligent search navigator. Enter a quick paper code (e.g., 9702/23/O/N/22) for instant access, or use manual filters to browse by curriculum, subject, paper type, variant, and season.

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/navigator.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-top:-10px; border: 3px solid #0084ff;margin-bottom:10px" />

- **🔖 Smart Bookmarking and progress tracking**: Create custom bookmark lists to organize questions by topic, difficulty, or revision priority. And mark questions as completed and track your progress.

<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/bookmark2.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-top:-10px;margin-bottom:10px; border: 3px solid #0084ff;margin-bottom:10px;" />
<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/bookmark.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-bottom:10px; border: 3px solid #0084ff;" />
<img src="https://raw.githubusercontent.com/caocchinh/noteoverflow/refs/heads/master/public/assets/github/select_subject.webp" alt="Topical Question Browser Screenshot" style="border-radius: 10px;margin-bottom:10px; border: 3px solid #0084ff;" />

## 🛠️ Tech Stack

NoteOverflow is built using cutting-edge technologies to ensure scalability, performance, and developer experience:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Caching**: [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Object Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Authentication**: [Better Auth](https://github.com/better-auth/better-auth)
- **PDF/Annotations**: [PDFTron WebViewer](https://www.pdftron.com/)
- **Deployment**: [Cloudflare Workers/Pages](https://workers.cloudflare.com/) via OpenNext

## 🤝 Contributing

> **⚠️ Note**: NoteOverflow is currently in **beta development** and is not yet open for external contributions.
>
> I am actively working on stabilizing the platform and will open contributions to the community once I reach a stable release. Thank you for your interest and patience!

Stay tuned for updates on when I'll be accepting contributions. In the meantime, feel free to star ⭐ the repository to show your support and stay notified of future releases!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by Cao Cự Chính
</div>
