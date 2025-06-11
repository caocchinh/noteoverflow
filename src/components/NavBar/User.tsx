"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import Link from "next/link";
import { LogOut, SquareUserRound } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";

const User = () => {
  const [trigger, setTrigger] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["user", trigger],
    queryFn: async () => {
      console.log("fetching user");
      return await authClient.getSession();
    },
    refetchOnWindowFocus: false,
  });

  async function handleSignOut() {
    await authClient.signOut();
    setTrigger((prev) => !prev);
  }

  console.log(data);

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!data?.data) {
    return (
      <Button
        className="rounded-lg hover:opacity-90 bg-[var(--navbar-text)] text-[var(--navbar-bg)] hover:bg-[var(--navbar-text)] hover:text-[var(--navbar-bg)]"
        asChild
        title="Sign in to access all features"
      >
        <Link href="/authentication">
          <SquareUserRound />
          Sign in
        </Link>
      </Button>
    );
  }
  return (
    <div className="">
      <Image
        src={data.data?.user.image || "/assets/avatar/blue.png"}
        alt="user"
        width={32}
        height={32}
        className="rounded-full"
      />
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut />
      </Button>
    </div>
  );
};

export default User;
