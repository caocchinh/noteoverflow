/* eslint-disable @next/next/no-img-element */
"use client";
import { authClient } from "@/lib/auth/auth-client";
import { useT } from "../i18n/client";
import { Button } from "@/components/ui/button";

const TestPage = ({ email }: { email?: string }) => {
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
      <img src="/assets/logo-colorised.png" alt="favicon" />
      <Button onClick={handleSignIn}>{t("title")}</Button>
      <Button onClick={handleSignOut} className="bg-red-500">
        {t("title")}
      </Button>
    </div>
  );
};

export default TestPage;
