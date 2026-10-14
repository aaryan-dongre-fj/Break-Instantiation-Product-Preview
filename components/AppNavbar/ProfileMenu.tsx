"use client";
import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { useLook } from "@/components/LookProvider";
import { Button } from "@/components/ui/button";

/**
 * The signed-in email lives in a cookie on this origin and is handed down
 * via context by whichever page renders the report experience.
 */
export const StaffEmailContext = createContext<string | null>(null);

export default function ProfileMenu() {
  const email = useContext(StaffEmailContext);
  const look = useLook();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const signOut = async () => {
    setIsSigningOut(true);
    await fetch("/api/preview/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="relative z-10">
      <Button
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-transparent hover:bg-transparent hover:cursor-pointer p-2 touch-manipulation shadow-none"
      >
        <div className="flex items-center gap-2 border border-primary-text/15 rounded-full px-2.5 py-1.5 sm:px-3">
          <div className="flex items-center justify-center bg-secondary-background rounded-full w-8 h-8 shrink-0">
            <span className="text-primary-text text-sm font-medium uppercase">
              {email?.[0] || "S"}
            </span>
          </div>
          <div className="hidden md:flex md:flex-col md:items-start md:min-w-0">
            <span className="text-primary-text text-sm leading-tight truncate max-w-[180px] lg:max-w-[220px]">
              {look.name}
            </span>
            <span className="text-primary-text/60 text-xs leading-tight truncate max-w-[180px] lg:max-w-[220px]">
              {email || "Signed in"}
            </span>
          </div>
          <div className="text-primary-text">
            <IoIosArrowDown />
          </div>
        </div>
      </Button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-[min(300px,calc(100vw-3rem))] rounded-md shadow-lg bg-primary-background ring-1 ring-black ring-opacity-5 border border-primary-text/10">
          <div className="py-1">
            <Link
              href="/products"
              className="cursor-pointer block w-full px-4 py-2 text-sm text-primary-text hover:bg-secondary-background/20 text-left border-b border-primary-text/10"
              onClick={() => setIsDropdownOpen(false)}
            >
              All products
            </Link>
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="cursor-pointer block w-full px-4 py-2 text-sm text-primary-text hover:bg-secondary-background/20 text-left disabled:opacity-50"
            >
              {isSigningOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
