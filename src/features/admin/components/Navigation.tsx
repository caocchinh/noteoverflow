"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = ({ isOwner }: { isOwner: boolean }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-start md:justify-center gap-4 flex-wrap">
      <Button
        variant={pathname === "/admin/content" ? "default" : "outline"}
        asChild
      >
        <Link href="/admin/content">Content management</Link>
      </Button>
      <Button
        variant={pathname === "/admin/legacy" ? "default" : "outline"}
        asChild
      >
        <Link href="/admin/legacy">Legacy upload</Link>
      </Button>
      {isOwner && (
        <Button
          variant={pathname === "/admin/user" ? "default" : "outline"}
          asChild
        >
          <Link href="/admin/user">User management</Link>
        </Button>
      )}
    </div>
  );
};

export default Navigation;
