import { Github, Mail } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NoteOverflow - Rebuilding on Solid Foundations",
  description: "NoteOverflow is being rebuilt properly. Learn about our journey and what's next.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 px-4 pt-24 pb-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/assets/logo-full-colorised-white.webp"
            alt="NoteOverflow"
            width={400}
            height={80}
            priority
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-12">
          <h1 className="mb-2 text-center text-3xl font-bold text-white md:text-4xl">
            Rebuilding on Solid Foundations
          </h1>

          {/* Founder's Note */}
          <div className="mt-6 text-center">
            <h2 className="mb-3 text-xl font-semibold text-blue-400 md:text-2xl">
              Founder&apos;s Note
            </h2>
            <p className="text-lg text-gray-300">
              NoteOverflow is currently in maintenance as it&apos;s undergoing a strategic pivot.
            </p>
          </div>

          {/* Abstract */}
          <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
            <p className="leading-relaxed text-gray-300">
              I am the founder of NoteOverflow. Unfortunately, I have to voluntarily shut down the
              platform due to the ethical and legal implications of redistributing Cambridge
              Assessment&apos;s copyrighted examination materials without permission. While my
              intentions were to help students access practice resources, I have come to realize
              that building on someone else&apos;s intellectual property without authorization is
              not sustainable, nor is it right. This page explains what happened, what I learned,
              and what comes next.
            </p>
          </div>

          {/* Important Disclaimer */}
          <div className="mt-6 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="mb-2 text-lg font-bold text-amber-400">Important Disclaimer</p>
                <p className="leading-relaxed text-gray-300">
                  This shutdown is <strong className="text-white">entirely voluntary</strong>. I
                  have not received any legal notices, cease and desist letters, or threats from
                  Cambridge Assessment or any other party. This decision was made proactively based
                  on my own ethical reflection and understanding of copyright law. I chose to do the
                  right thing before being forced to.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-gray-300">
            {/* What Started Here */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">What Started Here</h2>
              <p>
                NoteOverflow launched in <strong className="text-white">August 2025</strong> with a
                simple mission: democratize access to Cambridge A-Level practice materials.
              </p>

              {/* Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400">2,000+</p>
                  <p className="mt-1 text-sm text-gray-400">Students Served</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">100+</p>
                  <p className="mt-1 text-sm text-gray-400">Peak Daily Active Users</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">9,000+</p>
                  <p className="mt-1 text-sm text-gray-400">Study Sessions</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">31 min</p>
                  <p className="mt-1 text-sm text-gray-400">Avg. Session Time</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-rose-400">25,797</p>
                  <p className="mt-1 text-sm text-gray-400">Finished Questions</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400">3,062</p>
                  <p className="mt-1 text-sm text-gray-400">Questions Bookmarked</p>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-400">
                All achieved organically in just 5 months, with minimal budget from a single
                student.
              </p>

              {/* Product-Market Fit Callout */}
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="mb-2 font-semibold text-emerald-400">What These Numbers Mean:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong className="text-white">31-minute average session time</strong> — Users
                    weren&apos;t just visiting; they were deeply engaged. Industry average for
                    EdTech is ~8-12 minutes.
                  </li>
                  <li>
                    <strong className="text-white">9,000+ study sessions</strong> — Students
                    returned repeatedly, indicating genuine utility, not curiosity clicks.
                  </li>
                </ul>
                <p className="mt-3 font-medium text-emerald-400">
                  The demand for better exam preparation tools is real and validated.
                </p>
              </div>

              <p className="mt-4">
                I saw talented students across multiple countries used NoteOverflow for their
                rigorous exam preparation, namely: Nigeria, the United States, the United Kingdom,
                the UAE, Bangladesh, Pakistan, Nepal, Malaysia, Singapore, Indonesia, the
                Philippines, Vietnams ...
              </p>
              <p className="mt-3 text-lg font-bold text-red-500">
                But I built it on a flawed foundation.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">What I Learned</h2>
              <p>
                I redistributed Cambridge Assessment&apos;s copyrighted content without permission.
                I rationalized it as &ldquo;helping students&rdquo; and &ldquo;not charging
                money,&rdquo; but those aren&apos;t legal defenses—they&apos;re excuses.
              </p>

              {/* Cambridge Copyright Policy - Blockquote */}
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
                <p className="mb-4 font-semibold text-red-400">Official Copyright Notice</p>
                <blockquote className="border-l-4 border-red-500 py-2 pl-4 text-white italic">
                  &ldquo;We do not grant permission for the use of complete examination papers, nor
                  do we grant permission for electronic publication, in any format, of questions
                  from past examination papers.&rdquo;
                </blockquote>
                <p className="mt-4 text-sm text-gray-400">
                  — Source: Cambridge Assessment International Education, Official Permission
                  Guidelines
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="https://help.cambridgeinternational.org/hc/en-gb/articles/115004418469-How-do-I-apply-for-permission-to-use-Cambridge-copyrighted-material"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                  >
                    How to apply for permission →
                  </Link>
                  <Link
                    href="https://help.cambridgeinternational.org/hc/en-gb/articles/203544371-Can-I-reproduce-Cambridge-past-examination-papers-on-the-school-s-website-my-website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Reproducing past papers on websites →
                  </Link>
                </div>
                <blockquote className="mt-4 border-l-4 border-red-500 py-2 pl-4 text-white italic">
                  &ldquo;We are unable to give permission to publish past examination papers on any
                  website or school intranet. This is due to the lack of control over the material
                  once it is published on the internet. There have been several incidents of misuse
                  of our material (including its sale online) and for this reason we do not give
                  permission for publication on the internet.&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-gray-400">
                  — Source: Cambridge Assessment International Education, Official Permission
                  Guidelines
                </p>
                <p className="mt-4 text-sm font-medium text-amber-400">
                  Translation: There is zero chance a student-run platform like NoteOverflow would
                  ever receive official permission from Cambridge. The path I chose was never going
                  to be sustainable.
                </p>
                <p className="mt-3 text-sm text-gray-300">
                  <strong className="text-white">A note on other websites:</strong> While you may
                  find many other websites on the internet offering similar services—hosting
                  Cambridge past papers, topical questions, or mark schemes—the vast majority of
                  them are operating illegally. Unless a platform has explicit written permission
                  from Cambridge Assessment (which, as stated above, is virtually never granted for
                  electronic publication), they are infringing on Cambridge&apos;s copyright. The
                  difference is that I chose to acknowledge this and shut down voluntarily rather
                  than wait for legal action.
                </p>
              </div>
              {/* Cambridge Licensing Reality */}
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="mb-3 font-semibold text-amber-400">
                  Why &ldquo;Just Get Permission&rdquo; Wasn&apos;t an Option:
                </p>
                <p className="mb-4 text-sm text-gray-300">
                  Cambridge does have a formal copyright application process. Here&apos;s what it
                  actually requires:
                </p>

                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    <strong className="text-amber-400">Key restrictions:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1 text-gray-400">
                    <li>Max 70% of questions from any one paper</li>
                    <li>No electronic publication in any format</li>
                    <li>No questions from papers before 2017</li>
                    <li>Cannot mix questions from different paper variants</li>
                    <li>Must send physical copies with hand-written signatures</li>
                  </ul>
                  <p className="mt-3">
                    <strong className="text-amber-400">The fees:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1 text-gray-400">
                    <li>£300 per application (1-50 questions)</li>
                    <li>£450 per application (51-100 questions)</li>
                    <li>£600 per application (101+ questions)</li>
                  </ul>
                  <p className="mt-3 font-medium text-red-400">
                    💡 NoteOverflow had 30,000+ questions across multiple subjects. The licensing
                    fees alone would be thousands of pounds, and they still wouldn&apos;t approve
                    electronic publication.
                  </p>
                </div>
              </div>
              <p className="mt-3">
                The wake-up call came when I realized hundreds of students had become dependent on
                infrastructure I&apos;d built on someone else&apos;s intellectual property. I had
                created systemic dependency on a legally fragile foundation.
              </p>
              <p className="mt-3 text-blue-400">
                In <strong>January 2026</strong>, I made the hard but right decision to remove all
                Cambridge content, essentially shutting down the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">What I&apos;m Building Next</h2>
              <p>
                The technical infrastructure I built—semantic search with vector embeddings, topical
                question filtering, cloud-synced PDF annotations, progress tracking,
                bookmarking—that work is legitimate and valuable. The mistake was in the content
                source, not the innovation.
              </p>
              <p className="mt-3">I&apos;m now exploring how to rebuild NoteOverflow properly:</p>
              <ul className="mt-2 ml-4 list-inside list-disc space-y-1 text-gray-400">
                <li>
                  Seeking legitimate licensing partnerships with educational content providers
                </li>
                <li>Developing original practice materials</li>
                <li>Designing a sustainable model that can serve students for generations</li>
              </ul>

              <p className="mt-3 font-medium text-white">
                The goal hasn&apos;t changed. The approach has.
              </p>
            </section>

            {/* What This Taught Me */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">What This Taught Me</h2>
              <p>
                You can&apos;t build enduring institutions on shortcuts. Technical brilliance
                without legal literacy is a liability, not an asset. And &ldquo;free&rdquo; is the
                most expensive business model if you don&apos;t own the rights to what you&apos;re
                distributing.
              </p>
              <p className="mt-3">
                I&apos;m learning to ask not just &ldquo;Can I build this?&rdquo; but &ldquo;Should
                I build this? Is it sustainable? What are the legal, ethical, and business
                implications?&rdquo;
              </p>
              <p className="mt-3 font-medium text-emerald-400">
                That&apos;s the difference between a hacker and an entrepreneur.
              </p>
              <p className="mt-3 font-medium text-white italic">
                True innovation respects the ecosystem it serves.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Thank You ❤️</h2>
              <p>
                To every student who trusted NoteOverflow for their exam preparation—thank you. Your
                feedback, your bug reports, your feature requests, and most importantly, your trust
                meant everything to me.
              </p>
              <p className="mt-3">
                To everyone who spread the word, shared the platform with classmates, and believed
                in what I was building. I&apos;m deeply grateful. You showed me that this mission
                matters.
              </p>
              <p className="mt-4 font-medium text-amber-400">
                I haven&apos;t abandoned you. This isn&apos;t goodbye. It&apos;s a &ldquo;see you.
                soon&rdquo;. The platform you relied on taught me how to build the platform you
                deserve. Version 2.0 will serve you properly,and for the long term.
              </p>
            </section>

            {/* Divider */}
            <div className="border-t border-white/10 pt-8">
              {/* Quote */}
              <blockquote className="text-center text-xl text-white/90 italic md:text-2xl">
                &ldquo;Failure is an option here. If things are not failing, you are not innovating
                enough.&rdquo;
              </blockquote>
              <p className="mt-3 text-center text-gray-400">— Elon Musk</p>

              <div className="mt-6 text-center text-gray-300">
                The failure to do things right before launch taught me more than any success could
                have. I planted NoteOverflow on unstable foundation.
                <br />
                <p className="text-md mt-4 text-center text-gray-300">
                  Now I&apos;m replanting it properly with roots that can support decades of growth.
                </p>
              </div>

              <p className="mt-6 text-center text-lg font-semibold text-blue-400">Stay tuned.</p>
            </div>

            <div className="pt-4 text-center">
              <p className="font-medium text-white">— Cao Cự Chính</p>
              <p className="text-sm text-gray-500">17/01/2025 10:18 PM UTC+7</p>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 border-t border-white/10 pt-6">
            <Link
              href="mailto:chinhcaocu@gmail.com"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <Mail className="h-5 w-5" />
              chinhcaocu@gmail.com
            </Link>
            <Link
              href="https://github.com/caocchinh/noteoverflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <Github className="h-5 w-5" />
              View Source Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
