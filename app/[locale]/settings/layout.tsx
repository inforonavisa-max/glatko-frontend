import type { Metadata } from "next";
import { SettingsNav } from "@/components/settings/SettingsNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsNav />
      {children}
    </>
  );
}
