import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Github, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "NoteOverflow - Rebuilding on Solid Foundations",
  description:
    "NoteOverflow is being rebuilt properly. Learn about our journey and what's next.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 pt-24 via-gray-800 to-gray-900 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/logo-full-colorised-white.webp"
            alt="NoteOverflow"
            width={400}
            height={80}
            priority
          />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
            Rebuilding on Solid Foundations
          </h1>

          {/* Abstract */}
          <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-gray-300 leading-relaxed">
              I am the founder of NoteOverflow. Unfortunately, I have to
              voluntarily shut down the platform due to the ethical and legal
              implications of redistributing Cambridge Assessment&apos;s
              copyrighted examination materials without permission. While my
              intentions were to help students access practice resources, I have
              come to realize that building on someone else&apos;s intellectual
              property without authorization is not sustainable, nor is it
              right. This page explains what happened, what I learned, and what
              comes next.
            </p>
          </div>

          {/* Important Disclaimer */}
          <div className="mt-6 p-6 bg-amber-500/10 border-2 border-amber-500/50 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-amber-400 font-bold text-lg mb-2">
                  Important Disclaimer
                </p>
                <p className="text-gray-300 leading-relaxed">
                  This shutdown is{" "}
                  <strong className="text-white">entirely voluntary</strong>. I
                  have not received any legal notices, cease and desist letters,
                  or threats from Cambridge Assessment or any other party. This
                  decision was made proactively based on my own ethical
                  reflection and understanding of copyright law. I chose to do
                  the right thing before being forced to.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 mt-8">
            {/* What Started Here */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                What Started Here
              </h2>
              <p>
                NoteOverflow launched in{" "}
                <strong className="text-white">August 2025</strong> with a
                simple mission: democratize access to Cambridge A-Level practice
                materials.
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-blue-400">2,000+</p>
                  <p className="text-sm text-gray-400 mt-1">Students Served</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-emerald-400">100+</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Peak Daily Active Users
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-amber-400">9,000+</p>
                  <p className="text-sm text-gray-400 mt-1">Study Sessions</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-purple-400">31 min</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Avg. Session Time
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-rose-400">25,797</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Finished Questions
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-cyan-400">3,062</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Questions Bookmarked
                  </p>
                </div>
              </div>

              <p className="mt-6 text-gray-400 text-sm text-center">
                All achieved organically in just 5 months, with minimal budget
                from a single student.
              </p>

              {/* Product-Market Fit Callout */}
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-emerald-400 font-semibold mb-2">
                  What These Numbers Mean:
                </p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>
                    <strong className="text-white">
                      31-minute average session time
                    </strong>{" "}
                    — Users weren&apos;t just visiting; they were deeply
                    engaged. Industry average for EdTech is ~8-12 minutes.
                  </li>
                  <li>
                    <strong className="text-white">
                      9,000+ study sessions
                    </strong>{" "}
                    — Students returned repeatedly, indicating genuine utility,
                    not curiosity clicks.
                  </li>
                </ul>
                <p className="mt-3 text-emerald-400 font-medium">
                  The demand for better exam preparation tools is real and
                  validated.
                </p>
              </div>

              <p className="mt-4">
                I saw talented students across multiple countries used
                NoteOverflow for their rigorous exam preparation, namely:
                Nigeria, the United States, the United Kingdom, the UAE,
                Bangladesh, Pakistan, Nepal, Malaysia, Singapore, Indonesia, the
                Philippines, Vietnams ...
              </p>
              <p className="mt-3 text-red-500 font-bold text-lg">
                But I built it on a flawed foundation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                What I Learned
              </h2>
              <p>
                I redistributed Cambridge Assessment&apos;s copyrighted content
                without permission. I rationalized it as &ldquo;helping
                students&rdquo; and &ldquo;not charging money,&rdquo; but those
                aren&apos;t legal defenses—they&apos;re excuses.
              </p>

              {/* Cambridge Copyright Policy - Blockquote */}
              <div className="mt-4 p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-semibold mb-4">
                  Official Copyright Notice
                </p>
                <blockquote className="border-l-4 border-red-500 pl-4 py-2 text-white italic">
                  &ldquo;We do not grant permission for the use of complete
                  examination papers, nor do we grant permission for electronic
                  publication, in any format, of questions from past examination
                  papers.&rdquo;
                </blockquote>
                <p className="text-sm text-gray-400 mt-4">
                  — Source: Cambridge Assessment International Education,
                  Official Permission Guidelines
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
                <blockquote className="border-l-4 border-red-500 pl-4 py-2 text-white italic mt-4">
                  &ldquo;We are unable to give permission to publish past
                  examination papers on any website or school intranet. This is
                  due to the lack of control over the material once it is
                  published on the internet. There have been several incidents
                  of misuse of our material (including its sale online) and for
                  this reason we do not give permission for publication on the
                  internet.&rdquo;
                </blockquote>
                <p className="text-sm text-gray-400 mt-2">
                  — Source: Cambridge Assessment International Education,
                  Official Permission Guidelines
                </p>
                <p className="mt-4 text-amber-400 text-sm font-medium">
                  Translation: There is zero chance a student-run platform like
                  NoteOverflow would ever receive official permission from
                  Cambridge. The path I chose was never going to be sustainable.
                </p>
                <p className="mt-3 text-gray-300 text-sm">
                  <strong className="text-white">
                    A note on other websites:
                  </strong>{" "}
                  While you may find many other websites on the internet
                  offering similar services—hosting Cambridge past papers,
                  topical questions, or mark schemes—the vast majority of them
                  are operating illegally. Unless a platform has explicit
                  written permission from Cambridge Assessment (which, as stated
                  above, is virtually never granted for electronic publication),
                  they are infringing on Cambridge&apos;s copyright. The
                  difference is that I chose to acknowledge this and shut down
                  voluntarily rather than wait for legal action.
                </p>
              </div>
              {/* Cambridge Licensing Reality */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-amber-400 font-semibold mb-3">
                  Why &ldquo;Just Get Permission&rdquo; Wasn&apos;t an Option:
                </p>
                <p className="text-sm text-gray-300 mb-4">
                  Cambridge does have a formal copyright application process.
                  Here&apos;s what it actually requires:
                </p>

                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong className="text-amber-400">
                      Key restrictions:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-gray-400">
                    <li>Max 70% of questions from any one paper</li>
                    <li>No electronic publication in any format</li>
                    <li>No questions from papers before 2017</li>
                    <li>Cannot mix questions from different paper variants</li>
                    <li>
                      Must send physical copies with hand-written signatures
                    </li>
                  </ul>
                  <p className="mt-3">
                    <strong className="text-amber-400">The fees:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-gray-400">
                    <li>£300 per application (1-50 questions)</li>
                    <li>£450 per application (51-100 questions)</li>
                    <li>£600 per application (101+ questions)</li>
                  </ul>
                  <p className="mt-3 text-red-400 font-medium">
                    💡 NoteOverflow had 30,000+ questions across multiple
                    subjects. The licensing fees alone would be thousands of
                    pounds, and they still wouldn&apos;t approve electronic
                    publication.
                  </p>
                </div>
              </div>
              <p className="mt-3">
                The wake-up call came when I realized hundreds of students had
                become dependent on infrastructure I&apos;d built on someone
                else&apos;s intellectual property. I had created systemic
                dependency on a legally fragile foundation.
              </p>
              <p className="mt-3 text-blue-400">
                In <strong>January 2026</strong>, I made the hard but right
                decision to remove all Cambridge content, essentially shutting
                down the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                What I&apos;m Building Next
              </h2>
              <p>
                The technical infrastructure I built—semantic search with vector
                embeddings, topical question filtering, cloud-synced PDF
                annotations, progress tracking, bookmarking—that work is
                legitimate and valuable. The mistake was in the content source,
                not the innovation.
              </p>
              <p className="mt-3">
                I&apos;m now exploring how to rebuild NoteOverflow properly:
              </p>
              <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-gray-400">
                <li>
                  Seeking legitimate licensing partnerships with educational
                  content providers
                </li>
                <li>Developing original practice materials</li>
                <li>
                  Designing a sustainable model that can serve students for
                  generations
                </li>
              </ul>

              <p className="mt-3 font-medium text-white">
                The goal hasn&apos;t changed. The approach has.
              </p>
            </section>

            {/* What This Taught Me */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                What This Taught Me
              </h2>
              <p>
                You can&apos;t build enduring institutions on shortcuts.
                Technical brilliance without legal literacy is a liability, not
                an asset. And &ldquo;free&rdquo; is the most expensive business
                model if you don&apos;t own the rights to what you&apos;re
                distributing.
              </p>
              <p className="mt-3">
                I&apos;m learning to ask not just &ldquo;Can I build
                this?&rdquo; but &ldquo;Should I build this? Is it sustainable?
                What are the legal, ethical, and business implications?&rdquo;
              </p>
              <p className="mt-3 text-emerald-400 font-medium">
                That&apos;s the difference between a hacker and an entrepreneur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Thank You ❤️
              </h2>
              <p>
                To every student who trusted NoteOverflow for their exam
                preparation—thank you. Your feedback, your bug reports, your
                feature requests, and most importantly, your trust meant
                everything to me.
              </p>
              <p className="mt-3">
                To everyone who spread the word, shared the platform with
                classmates, and believed in what I was building. I&apos;m deeply
                grateful. You showed me that this mission matters.
              </p>
              <p className="mt-4 text-amber-400 font-medium">
                I haven&apos;t abandoned you. This isn&apos;t goodbye. It&apos;s
                a &ldquo;see you soon&rdquo; .The platform you relied on taught
                me how to build the platform you deserve. Version 2.0 will serve
                you properly,and for the long term.
              </p>
            </section>

            {/* Divider */}
            <div className="border-t border-white/10 pt-8">
              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-white/90 italic text-center">
                &ldquo;Failure is an option here. If things are not failing, you
                are not innovating enough.&rdquo;
              </blockquote>
              <p className="text-gray-400 mt-3 text-center">— Elon Musk</p>

              <p className="mt-6 text-center text-gray-300">
                The failure to do things right before launch taught me more than
                any success could have. I planted NoteOverflow on unstable
                foundation.
                <br />
                <p className="mt-4 text-center text-md text-gray-300">
                  Now I&apos;m replanting it properly with roots that can
                  support decades of growth.
                </p>
              </p>

              <p className="mt-6 text-center text-blue-400 font-semibold text-lg">
                Stay tuned.
              </p>
            </div>

            <div className="text-center pt-4">
              <p className="text-white font-medium">— Cao Cự Chính</p>
              <p className="text-gray-500 text-sm">17/01/2025 10:18 PM UTC+7</p>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-6">
            <Link
              href="mailto:chinhcaocu@gmail.com"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
              chinhcaocu@gmail.com
            </Link>
            <Link
              href="https://github.com/caocchinh/noteoverflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
