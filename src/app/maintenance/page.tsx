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
      <div className="max-w-3xl mx-auto">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-blue-400">2,000+</p>
                  <p className="text-sm text-gray-400 mt-1">Students Served</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-emerald-400">100+</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Daily Active Users
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
              </div>

              <p className="mt-6 text-gray-400 text-sm text-center">
                All achieved organically in just 5 months, with minimal budget
                from a single student.
              </p>

              <p className="mt-4">
                Students across multiple countries used NoteOverflow for topical
                filtering, cloud-synced annotations, and progress tracking. The
                engagement metrics proved the demand was real.
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

              {/* Cambridge Copyright Policy */}
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-semibold mb-3">
                  ⚠️ Cambridge&apos;s Official Policy:
                </p>
                <Link
                  href="https://help.cambridgeinternational.org/hc/en-gb/articles/203544371-Can-I-reproduce-Cambridge-past-examination-papers-on-the-school-s-website-my-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image
                    src="/assets/cambridge-copyright-policy.png"
                    alt="Cambridge Copyright Policy - We are unable to give permission to publish past examination papers on any website"
                    width={700}
                    height={400}
                    className="rounded-lg border border-white/10 w-full"
                  />
                </Link>
                <p className="text-sm text-gray-400 mt-3">
                  <span className="text-red-400 font-medium">
                    &ldquo;We are unable to give permission to publish past
                    examination papers on any website or school intranet.&rdquo;
                  </span>{" "}
                  — Cambridge International Education
                </p>
                <Link
                  href="https://help.cambridgeinternational.org/hc/en-gb/articles/203544371-Can-I-reproduce-Cambridge-past-examination-papers-on-the-school-s-website-my-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline mt-2 inline-block"
                >
                  View official Cambridge policy →
                </Link>
              </div>

              {/* Second Cambridge Policy - No Permission for Electronic Publication */}
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-semibold mb-3">
                  ⛔ Even if you apply for permission:
                </p>
                <Image
                  src="/assets/cambridge-no-permission.png"
                  alt="Cambridge states they do not grant permission for electronic publication in any format"
                  width={700}
                  height={400}
                  className="rounded-lg border border-white/10 w-full"
                />
                <p className="text-sm text-gray-400 mt-3">
                  <span className="text-red-400 font-medium">
                    &ldquo;We do not grant permission for the use of complete
                    examination papers, nor do we grant permission for
                    electronic publication, in any format.&rdquo;
                  </span>
                </p>
                <p className="mt-3 text-amber-400 text-sm font-medium">
                  💡 Translation: There is zero chance a student-run platform
                  like NoteOverflow would ever receive official permission from
                  Cambridge. The path I chose was never going to be sustainable.
                </p>
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
                embeddings, cloud-synced PDF annotations, progress tracking—that
                work is legitimate and valuable. The mistake was in the content
                source, not the innovation.
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
                classmates, and believed in what I was building—I&apos;m deeply
                grateful. You showed me that this mission matters.
              </p>
              <p className="mt-3 text-amber-400">
                This isn&apos;t goodbye. It&apos;s a &ldquo;see you soon.&rdquo;
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
              <p className="text-gray-500 text-sm">January 2025</p>
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
