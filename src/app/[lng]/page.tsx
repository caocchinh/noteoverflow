"use client";
import { useT } from "../i18n/client";
import { authClient } from "@/lib/auth/auth-client";

export default function Home() {
  const { t } = useT("landing-page");
  const handleSignIn = async () => {
    try {
      console.log("bbbbbbbbb");
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error(t("sign_in_error"), error);
    }
  };

  return (
    <div>
      <button onClick={handleSignIn}>{t("title")}</button>
    </div>
  );
}
