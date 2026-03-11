import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Personal Organizer App",
  description: "Track projects, milestones, contacts, tools, and update history in one place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <main className="page-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
