# Interview Roadmap Platform

A modern, responsive web application built with [Next.js](https://nextjs.org) that provides comprehensive, structured Interview Roadmaps for software engineering roles and technologies.

## 🚀 Key Features

*   **Interactive Learning Paths:** Follow structured, step-by-step guides from beginner to advanced topics.
*   **Rich Content Rendering:** Markdown parsing with syntax highlighting using `marked` and `prism-react-renderer`.
*   **Modern Theming:** Supports multiple themes including Light, Dark, and a custom Monochrome off-white theme.
*   **Responsive UI:** Fully responsive design built with Tailwind CSS v4, optimized for both desktop and mobile.
*   **Performance:** Powered by Next.js 16 and React 19, delivering fast, optimized loading times.

## 📚 Available Roadmaps

1.  🧠 **Data Structures & Algorithms (DSA)** - Master DSA from beginner to advanced: arrays, trees, graphs, DP, and interview-level problem solving.
2.  🤖 **Sr. Android Developer** - Prepare for Senior roles at top tech companies, covering architecture, Kotlin, system design, DSA, and behavioral interviews.
3.  ⚡ **JavaScript** - Master the language of the web, from basic variables to advanced design patterns.
4.  🔷 **TypeScript** - Add type safety to your JavaScript workflow with interfaces, generics, and advanced utility types.
5.  📱 **Sr. React Native Engineer** - Deep dive into React Native architecture, performance, internals, system design, and technical leadership.

*(More roadmaps coming soon: React, Node.js, Python, CSS)*

## 🛠️ Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org) (React 19)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com) & PostCSS
*   **Content Parsing:** `marked`
*   **Syntax Highlighting:** `prism-react-renderer`
*   **Package Manager:** `bun` / `npm`

## 🏃‍♂️ Getting Started

First, install the dependencies:

```bash
bun install
# or npm install
```

Then, run the development server:

```bash
bun dev
# or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The main entry point for the application is within `src/app/`.

## 📁 Project Structure

*   `src/app/` - Next.js App Router pages and layouts.
*   `src/components/` - Reusable UI components.
*   `src/data/` - Static JSON/JS data and markdown content for the different roadmaps and their respective phases.
*   `src/themes.js` - Configuration for the custom Light, Dark, and Monochrome themes.

## 📝 License

This project is licensed under the MIT License.
