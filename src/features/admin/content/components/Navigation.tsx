"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-start md:justify-center gap-4 mt-2 flex-wrap">
      <Button
        asChild
        title="Upload"
        className={cn(
          " text-primary border-transparent rounded-none bg-transparent shadow-none cursor-pointer hover:bg-transparent hover:text-primary",
          pathname === "/admin/content/upload" && "border-b border-logo-main"
        )}
      >
        <Link href="/admin/content/upload">Upload</Link>
      </Button>
      <Button
        asChild
        title="Update"
        className={cn(
          " text-primary border-transparent rounded-none bg-transparent shadow-none cursor-pointer hover:bg-transparent hover:text-primary",
          pathname === "/admin/content/update" && "border-b border-logo-main"
        )}
      >
        <Link href="/admin/content/update">Update</Link>
      </Button>
      <Button
        asChild
        title="Delete"
        className={cn(
          " text-primary border-transparent rounded-none bg-transparent shadow-none cursor-pointer hover:bg-transparent hover:text-primary",
          pathname === "/admin/content/delete" && "border-b border-logo-main"
        )}
      >
        <Link href="/admin/content/delete">Delete</Link>
      </Button>
    </div>
  );
};

export default Navigation;
