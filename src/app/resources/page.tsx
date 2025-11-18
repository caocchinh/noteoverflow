// import type { Metadata } from "next";
// import Link from "next/link";
// import {
//   ArrowUpRight,
//   BookMarked,
//   Brain,
//   Globe2,
//   GraduationCap,
//   NotebookPen,
//   Podcast,
//   Sparkles,
//   Video,
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export const metadata: Metadata = {
//   title: "Student resources | NoteOverflow",
//   description:
//     "Curated study resources for AS & A-level learners: revision planners, skill labs, mentorship, and trusted links compiled by NoteOverflow.",
//   openGraph: {
//     title: "Student resources | NoteOverflow",
//     description:
//       "A curated hub of planners, guides, study skill labs, and student support links for AS & A-level success.",
//     url: "https://noteoverflow.com/resources",
//   },
// };

// type ResourceCollection = {
//   title: string;
//   description: string;
//   highlights: string[];
//   icon: LucideIcon;
//   tag: string;
// };

// type CuratedLink = {
//   title: string;
//   description: string;
//   href: string;
//   category: string;
// };

// type SubjectResource = {
//   subject: string;
//   code: string;
//   zNotesUrl: string;
//   focus: string;
// };

// type PlaceholderBlock = {
//   title: string;
//   description: string;
//   hint: string;
// };

// const resourceCollections: ResourceCollection[] = [
//   {
//     title: "Strategic revision planners",
//     description:
//       "Modular study planners that blend syllabus checkpoints with NoteOverflow topical sets.",
//     highlights: [
//       "Week-by-week targets for Sciences, Maths & Humanities",
//       "Custom difficulty sliders to balance strong vs. weak topics",
//       "Printable and Notion-ready templates",
//     ],
//     icon: NotebookPen,
//     tag: "Planning",
//   },
//   {
//     title: "Skill labs & mastery sprints",
//     description:
//       "10-day micro courses to repair blind spots in calculations, analysis, and writing skills.",
//     highlights: [
//       "Data-handling drills with worked solutions",
//       "Essay scaffolds & examiner-style peer review",
//       "Mark-scheme translation exercises",
//     ],
//     icon: Brain,
//     tag: "Practice",
//   },
//   {
//     title: "Mentor & peer support",
//     description:
//       "Access to weekly office hours, accountability circles, and mentor-matched study rooms.",
//     highlights: [
//       "Cloud-first whiteboards for co-working",
//       "Archived session library with timestamps",
//       "Opt-in progress check-ins via email",
//     ],
//     icon: GraduationCap,
//     tag: "Support",
//   },
// ];

// const subjectResources: SubjectResource[] = [
//   {
//     subject: "Physics",
//     code: "9702",
//     zNotesUrl: "https://znotes.org/caie/as-level/physics-9702",
//     focus:
//       "Topic-by-topic write-ups covering measurements, waves, quantum, and practical guidance.",
//   },
//   {
//     subject: "Chemistry",
//     code: "9701",
//     zNotesUrl: "https://znotes.org/caie/as-level/chemistry-9701",
//     focus:
//       "Concise notes for physical, inorganic, and organic chemistry with common exam triggers.",
//   },
//   {
//     subject: "Biology",
//     code: "9700",
//     zNotesUrl: "https://znotes.org/caie/as-level/biology-9700",
//     focus:
//       "Summaries for cells, genetics, physiology, and ecology plus diagrams for long-answer recall.",
//   },
//   {
//     subject: "Mathematics",
//     code: "9709",
//     zNotesUrl: "https://znotes.org/caie/as-level/mathematics-9709",
//     focus:
//       "Pure, mechanics, and probability notes aligned with each paper combination.",
//   },
//   {
//     subject: "Further Mathematics",
//     code: "9231",
//     zNotesUrl: "https://znotes.org/caie/a-level/further-mathematics-9231",
//     focus:
//       "Extended complex numbers, matrices, and extra mechanics resources for high-band prep.",
//   },
//   {
//     subject: "Computer Science",
//     code: "9618",
//     zNotesUrl: "https://znotes.org/caie/as-level/computer-science-9618",
//     focus:
//       "Algorithm design, data representation, and pseudocode conventions distilled for Paper 1/2.",
//   },
//   {
//     subject: "Economics",
//     code: "9708",
//     zNotesUrl: "https://znotes.org/caie/as-level/economics-9708",
//     focus:
//       "Micro and macro theory snapshots plus evaluative sentence starters for structured responses.",
//   },
//   {
//     subject: "Business",
//     code: "9609",
//     zNotesUrl: "https://znotes.org/caie/as-level/business-9609",
//     focus:
//       "Strategic frameworks, ratio analysis, and case-study application tips for Papers 1-4.",
//   },
// ];

// const coursebookPlaceholders: PlaceholderBlock[] = [
//   {
//     title: "AS core text",
//     description:
//       "Reserve this slot for the main Cambridge-endorsed coursebook covering fundamentals.",
//     hint: "Include edition, ISBN, and swirl in Google Books or publisher links when ready.",
//   },
//   {
//     title: "Exam practice companion",
//     description:
//       "Use this card for workbooks or topical drills that pair well with NoteOverflow sets.",
//     hint: "Add author, publication year, and a short note on the paper types supported.",
//   },
//   {
//     title: "Stretch and enrichment",
//     description:
//       "Highlight challenge texts for olympiad, STEP, or interview-style thinking.",
//     hint: "Mention prerequisite knowledge and best chapters for quick wins.",
//   },
// ];

// const syllabusPlaceholders: PlaceholderBlock[] = [
//   {
//     title: "Latest Cambridge syllabus PDFs",
//     description:
//       "Drop direct links to the current specification documents for every subject code.",
//     hint: "Update annually so students always download the correct assessment version.",
//   },
//   {
//     title: "Planner-ready checklists",
//     description:
//       "Attach custom spreadsheets or Notion tables that break the syllabus into weekly targets.",
//     hint: "Link to shared drives or embedable sheets for collaborative planning.",
//   },
//   {
//     title: "Change-log highlights",
//     description:
//       "Summarise what changed between sessions (e.g., removed topics or new practical skills).",
//     hint: "Pair with bullet summaries so teachers can brief classes quickly.",
//   },
// ];

// const curatedLinks: CuratedLink[] = [
//   {
//     title: "Cambridge AS & A-level syllabuses (2025-2027)",
//     description:
//       "Official guide covering expectations, assessment objectives, and updates.",
//     href: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/",
//     category: "Official",
//   },
//   {
//     title: "NoteOverflow community hub",
//     description:
//       "A Discord space for question swaps, timed sprint rooms, and resource drops.",
//     href: "https://discord.gg/9ZNWkf3gR8",
//     category: "Community",
//   },
//   {
//     title: "Examiner report digest",
//     description:
//       "Summaries of examiner reports distilled into actionable do's and don'ts.",
//     href: "https://noteoverflow.com/blog/examiner-report-digest",
//     category: "Insights",
//   },
//   {
//     title: "Free STEM video walkthroughs",
//     description:
//       "Short-form topical explanations for Physics, Chemistry, and Further Maths.",
//     href: "https://www.youtube.com/@noteoverflow",
//     category: "Video",
//   },
// ];

// const mediaBlocks = [
//   {
//     title: "Resource briefings",
//     description:
//       "5-minute podcast drops unpacking new study playbooks and platform changes.",
//     icon: Podcast,
//   },
//   {
//     title: "Live study hall",
//     description:
//       "Weekly co-working session streamed with silent focus blocks + Q&A intervals.",
//     icon: Video,
//   },
//   {
//     title: "Global student network",
//     description:
//       "Region-based channels to swap localized school-based tips and requirements.",
//     icon: Globe2,
//   },
// ];

// export default function ResourcesPage() {
//   return (
//     <main className="bg-[var(--home-page-bg)] text-[var(--home-page-text)]">
//       <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-10 lg:px-20">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,132,255,0.35),_transparent_60%)]" />
//         <div className="relative z-10 mx-auto max-w-5xl text-center">
//           <p className="mx-auto mb-4 w-fit rounded-full border border-white/20 px-4 py-1 text-sm uppercase tracking-[0.3em] text-white/70">
//             Student resources
//           </p>
//           <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
//             Everything you need for calmer, smarter exam prep.
//           </h1>
//           <p className="mt-5 text-lg text-[var(--home-page-text-muted)]">
//             NoteOverflow combines curated study plans, collaborative practise,
//             and trusted references so AS & A-level students can focus on
//             learning—not logistics.
//           </p>
//           <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
//             <Button
//               asChild
//               size="lg"
//               className="min-w-[220px] bg-logo-main text-white hover:bg-logo-main/90"
//             >
//               <Link href="#resource-library">
//                 Browse the resource library
//                 <Sparkles className="ml-2 h-5 w-5" />
//               </Link>
//             </Button>
//             <Button
//               asChild
//               size="lg"
//               variant="outline"
//               className="min-w-[220px] border-white/30 bg-transparent text-white hover:bg-white/10"
//             >
//               <Link href="mailto:hello@noteoverflow.com">
//                 Talk to the support team
//               </Link>
//             </Button>
//           </div>
//           <dl className="mt-10 grid gap-6 sm:grid-cols-3">
//             {["70k+ topical drills", "40+ mentor sessions", "Free forever"].map(
//               (stat) => (
//                 <div
//                   key={stat}
//                   className="rounded-2xl border border-white/15 bg-white/5 px-4 py-6"
//                 >
//                   <dt className="text-sm text-white/70">Snapshot</dt>
//                   <dd className="text-2xl font-semibold">{stat}</dd>
//                 </div>
//               )
//             )}
//           </dl>
//         </div>
//       </section>

//       <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-10 lg:px-20">
//         <header className="space-y-3 text-center">
//           <p className="text-sm uppercase tracking-[0.4em] text-white/60">
//             Subject playbooks
//           </p>
//           <h2 className="text-3xl font-semibold">
//             ZNotes quick-links for every major syllabus.
//           </h2>
//           <p className="text-[var(--home-page-text-muted)]">
//             Each card jumps straight to the official ZNotes page so students can
//             revise the essentials before diving into NoteOverflow topical
//             practice.
//           </p>
//         </header>
//         <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {subjectResources.map((resource) => (
//             <Link
//               key={resource.code}
//               href={resource.zNotesUrl}
//               target="_blank"
//               rel="noreferrer"
//               className="group flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:border-logo-main/70 hover:bg-white/10"
//             >
//               <div>
//                 <p className="text-xs uppercase tracking-[0.4em] text-white/60">
//                   ZNotes
//                 </p>
//                 <h3 className="mt-2 text-2xl font-semibold">
//                   {resource.subject}
//                   <span className="ml-2 text-lg text-white/70">
//                     ({resource.code})
//                   </span>
//                 </h3>
//                 <p className="mt-3 text-sm text-white/80">{resource.focus}</p>
//               </div>
//               <div className="mt-4 flex items-center justify-between text-sm text-white/70">
//                 <span>Open study pack</span>
//                 <ArrowUpRight className="h-4 w-4 text-logo-main transition group-hover:translate-x-1 group-hover:-translate-y-1" />
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>

//       <section
//         id="resource-library"
//         className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-10 lg:px-20"
//       >
//         <header className="space-y-3 text-center">
//           <p className="text-sm uppercase tracking-[0.4em] text-white/60">
//             Resource library
//           </p>
//           <h2 className="text-3xl font-semibold">
//             Curated tracks for different study moments.
//           </h2>
//           <p className="text-[var(--home-page-text-muted)]">
//             Mix and match the collections below to cover strategy, practise, and
//             community support across the academic year.
//           </p>
//         </header>

//         <div className="grid gap-6 lg:grid-cols-3">
//           {resourceCollections.map((collection) => (
//             <article
//               key={collection.title}
//               className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
//             >
//               <div className="flex items-center gap-3">
//                 <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em]">
//                   {collection.tag}
//                 </span>
//                 <collection.icon className="h-5 w-5 text-logo-main" />
//               </div>
//               <div>
//                 <h3 className="text-2xl font-semibold">{collection.title}</h3>
//                 <p className="mt-2 text-[var(--home-page-text-muted)]">
//                   {collection.description}
//                 </p>
//               </div>
//               <ul className="mt-4 space-y-3 text-sm text-white/80">
//                 {collection.highlights.map((highlight) => (
//                   <li key={highlight} className="flex gap-2">
//                     <BookMarked className="mt-0.5 h-4 w-4 text-logo-main" />
//                     <span>{highlight}</span>
//                   </li>
//                 ))}
//               </ul>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section
//         id="coursebooks"
//         className="mx-auto max-w-6xl space-y-8 px-4 pb-16 sm:px-10 lg:px-20"
//       >
//         <header className="space-y-3 text-center">
//           <p className="text-sm uppercase tracking-[0.4em] text-white/60">
//             Coursebooks
//           </p>
//           <h2 className="text-3xl font-semibold">
//             Reference texts you will feature soon.
//           </h2>
//           <p className="text-[var(--home-page-text-muted)]">
//             Use the slots below when you are ready to showcase endorsed
//             textbooks, workbooks, or enrichment readers.
//           </p>
//         </header>
//         <div className="grid gap-4 md:grid-cols-3">
//           {coursebookPlaceholders.map((slot) => (
//             <div
//               key={slot.title}
//               className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 text-center"
//             >
//               <p className="text-xs uppercase tracking-[0.4em] text-white/60">
//                 Reserved
//               </p>
//               <h3 className="mt-3 text-xl font-semibold">{slot.title}</h3>
//               <p className="mt-2 text-sm text-white/80">{slot.description}</p>
//               <p className="mt-4 text-xs text-white/60">{slot.hint}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section
//         id="syllabus-updates"
//         className="mx-auto max-w-6xl space-y-8 px-4 pb-16 sm:px-10 lg:px-20"
//       >
//         <header className="space-y-3 text-center">
//           <p className="text-sm uppercase tracking-[0.4em] text-white/60">
//             Syllabus & planning
//           </p>
//           <h2 className="text-3xl font-semibold">
//             Keep official specs and trackers one click away.
//           </h2>
//           <p className="text-[var(--home-page-text-muted)]">
//             Drop Cambridge PDFs, internal trackers, or change-log summaries here
//             once you have the finalised documents.
//           </p>
//         </header>
//         <div className="grid gap-4 md:grid-cols-3">
//           {syllabusPlaceholders.map((slot) => (
//             <div
//               key={slot.title}
//               className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-5"
//             >
//               <p className="text-xs uppercase tracking-[0.4em] text-white/60">
//                 Coming soon
//               </p>
//               <h3 className="mt-3 text-xl font-semibold">{slot.title}</h3>
//               <p className="mt-2 text-sm text-white/80">{slot.description}</p>
//               <p className="mt-4 text-xs text-white/60">{slot.hint}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-10 lg:px-20">
//         <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
//           <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-logo-main/20 via-transparent to-transparent p-8">
//             <p className="text-sm uppercase tracking-[0.3em] text-white/70">
//               How we help
//             </p>
//             <h2 className="mt-3 text-3xl font-semibold">
//               Comprehensive support without extra fees.
//             </h2>
//             <p className="mt-3 text-[var(--home-page-text-muted)]">
//               Whether you&apos;re at the start of Year 12 or polishing final
//               papers, the NoteOverflow team keeps everything organised:
//               onboarding kits, clarity calls, and check-ins when motivation
//               dips.
//             </p>
//             <div className="mt-6 grid gap-4 md:grid-cols-2">
//               {mediaBlocks.map((block) => (
//                 <div
//                   key={block.title}
//                   className="rounded-2xl border border-white/15 bg-white/5 p-4"
//                 >
//                   <block.icon className="h-5 w-5 text-logo-main" />
//                   <h3 className="mt-3 text-xl font-semibold">{block.title}</h3>
//                   <p className="mt-2 text-sm text-white/75">
//                     {block.description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
//             <p className="text-sm uppercase tracking-[0.3em] text-white/70">
//               Next steps
//             </p>
//             <h3 className="mt-3 text-2xl font-semibold">
//               Build your personalised resource stack.
//             </h3>
//             <ol className="mt-6 space-y-4 text-sm text-white/85">
//               {[
//                 "Pick the syllabus & subject focus from the planner templates.",
//                 "Schedule a mentor or community sprint if you need accountability.",
//                 "Drop a note to hello@noteoverflow.com for bespoke requests.",
//               ].map((step, index) => (
//                 <li key={step} className="flex gap-3">
//                   <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-base font-semibold">
//                     {index + 1}
//                   </span>
//                   <p className="flex-1 pt-1">{step}</p>
//                 </li>
//               ))}
//             </ol>
//             <Button
//               asChild
//               size="lg"
//               className="mt-8 w-full bg-logo-main text-white hover:bg-logo-main/90"
//             >
//               <Link href="mailto:hello@noteoverflow.com">
//                 Request a curated pack
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-10 lg:px-20">
//         <header className="space-y-2 text-center">
//           <p className="text-sm uppercase tracking-[0.4em] text-white/60">
//             Trusted references
//           </p>
//           <h2 className="text-3xl font-semibold">
//             External links we recommend bookmarking.
//           </h2>
//         </header>
//         <div className="mt-8 grid gap-4 md:grid-cols-2">
//           {curatedLinks.map((link) => (
//             <Link
//               key={link.title}
//               href={link.href}
//               target={link.href.startsWith("http") ? "_blank" : undefined}
//               rel={link.href.startsWith("http") ? "noreferrer" : undefined}
//               className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-logo-main/60 hover:bg-white/10"
//             >
//               <p className="text-xs uppercase tracking-[0.4em] text-white/60">
//                 {link.category}
//               </p>
//               <h3 className="mt-2 text-xl font-semibold">{link.title}</h3>
//               <p className="mt-2 text-sm text-white/80">{link.description}</p>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// }

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <h1>Resources</h1>
    </main>
  );
}
