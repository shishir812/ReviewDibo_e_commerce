"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerNavLink() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    function syncUsername() {
      setUsername(window.localStorage.getItem("customerUsername") ?? "");
    }

    syncUsername();
    window.addEventListener("storage", syncUsername);
    window.addEventListener("customer-auth-changed", syncUsername);

    return () => {
      window.removeEventListener("storage", syncUsername);
      window.removeEventListener("customer-auth-changed", syncUsername);
    };
  }, []);

  return (
    <Link href="/customer" className="text-sm font-semibold text-slate-600 hover:text-primary">
      {username || "Login"}
    </Link>
  );
}
