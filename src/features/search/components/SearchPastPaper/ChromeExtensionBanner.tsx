import { ExternalLink } from "lucide-react";
import { memo } from "react";

const ChromeExtensionBanner = memo(() => {
  return (
    <div className="border-logo-main/30 from-logo-main/5 via-logo-main/5 to-logo-main/5 mb-4 overflow-hidden rounded-xl border-2 bg-linear-to-r">
      <a
        href="https://chromewebstore.google.com/detail/caie-paper-navigator/fbeddcmganoeefjijeddmlldchaidgbf"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 text-2xl">🚀</div>
          <div className="flex-1">
            <p className="text-logo-main text-sm font-semibold">Get the Chrome Extension!</p>
            <p className="text-muted-foreground text-xs">
              Install CAIE Paper Navigator for quick access to past papers
            </p>
          </div>
          <ExternalLink className="text-logo-main h-4 w-4 shrink-0" />
        </div>
      </a>
    </div>
  );
});

ChromeExtensionBanner.displayName = "ChromeExtensionBanner";

export default ChromeExtensionBanner;
