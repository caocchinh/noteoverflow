import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | NoteOverflow",
  description: "Legal disclaimer for NoteOverflow - Cambridge AS & A-Level past paper resources.",
};

export default function DisclaimerPage() {
  return (
    <div className="bg-background min-h-screen pt-20 pb-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">Disclaimer</h1>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold">Copyright & Intellectual Property</h2>
            <p className="text-muted-foreground">
              All examination materials, including but not limited to question papers, mark schemes,
              examiner reports, and grade thresholds displayed on this platform are the intellectual
              property of <strong>Cambridge Assessment International Education (CAIE)</strong>.
              These materials are protected by copyright law and are reproduced here for educational
              purposes only.
            </p>
            <p className="text-muted-foreground mt-3">
              NoteOverflow does not claim ownership of any Cambridge examination materials. All
              rights to the original content remain with Cambridge Assessment International
              Education.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">No Affiliation</h2>
            <p className="text-muted-foreground">
              NoteOverflow is an <strong>independent, open-source project</strong> and is{" "}
              <strong>not affiliated with, endorsed by, or sponsored by</strong> Cambridge
              Assessment International Education, Cambridge University Press, or any associated
              organizations.
            </p>
            <p className="text-muted-foreground mt-3">
              The use of Cambridge&apos;s examination materials on this platform does not imply any
              partnership, approval, or endorsement by Cambridge Assessment International Education.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Educational Use Only</h2>
            <p className="text-muted-foreground">
              This platform is intended <strong>solely for educational purposes</strong> to assist
              students in their examination preparation. The materials are provided to help
              students:
            </p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
              <li>Practice with past examination questions</li>
              <li>Understand examination formats and requirements</li>
              <li>Track their progress and identify areas for improvement</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Users are encouraged to obtain official materials directly from Cambridge Assessment
              International Education or their registered Cambridge school for the most accurate and
              up-to-date resources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Download & Export Restrictions</h2>
            <p className="text-muted-foreground">
              In compliance with copyright considerations, the{" "}
              <strong>download and export features have been disabled</strong> on this platform.
              Users may view and annotate materials within the platform but may not download or
              redistribute any copyrighted content.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Accuracy of Information</h2>
            <p className="text-muted-foreground">
              While we strive to ensure the accuracy of all materials and information on this
              platform, NoteOverflow makes <strong>no warranties or representations</strong>{" "}
              regarding the completeness, accuracy, reliability, or suitability of any content.
            </p>
            <p className="text-muted-foreground mt-3">
              Users should verify important information with official Cambridge sources. Any
              reliance on the materials provided is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              NoteOverflow and its contributors shall not be liable for any direct, indirect,
              incidental, consequential, or punitive damages arising from:
            </p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
              <li>Use or inability to use the platform</li>
              <li>Any errors or omissions in the content</li>
              <li>Any unauthorized access to user data</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Intellectual Property & Takedown Policy</h2>
            <p className="text-muted-foreground">
              If you are a copyright holder or representative and believe that content on this
              platform infringes upon your intellectual property rights, please contact by email at
              chinhcaocu@gmail.com with the relevant details. I will respond to valid takedown
              requests in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Changes to This Disclaimer</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify this disclaimer at any time. Changes will be effective
              immediately upon posting to this page. Your continued use of the platform constitutes
              acceptance of any modifications.
            </p>
          </section>

          <section className="mt-8 border-t pt-6">
            <p className="text-muted-foreground text-center text-sm">Last updated: January 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
