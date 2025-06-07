/* eslint-disable @next/next/no-img-element */
"use client";
import { authClient } from "@/lib/auth/auth-client";
import { useT } from "../i18n/client";
import { Button } from "@/components/ui/button";

const TestPage = ({ email }: { email?: string }) => {
  const { t } = useT("landing-page");

  const handleSignIn = async (provider: "google" | "discord" | "reddit") => {
    try {
      await authClient.signIn.social({
        provider,
      });
    } catch (error) {
      console.error(t("sign_in_error"), error);
    }
  };
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (error) {
      console.error(t("sign_out_error"), error);
    }
  };
  return (
    <div>
      <p>{email}</p>
      <img src="/assets/logo-bg-colorised-modified-small.png" alt="favicon" />
      <Button onClick={() => handleSignIn("google")}>
        {t("title")} with Google
      </Button>
      <Button
        onClick={() => handleSignIn("discord")}
        className="bg-[#5865F2] hover:bg-[#4752c4]"
      >
        {t("title")} with Discord
      </Button>
      <Button
        onClick={() => handleSignIn("reddit")}
        className="bg-[#FF4500] hover:bg-[#e03d00]"
      >
        {t("title")} with Reddit
      </Button>
      <Button onClick={handleSignOut} className="bg-red-500">
        {t("title")}
      </Button>
    </div>
  );
};

export default TestPage;
