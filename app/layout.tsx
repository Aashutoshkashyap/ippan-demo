import type { Metadata } from "next";
import "@/ippan/styles.css";
export const metadata: Metadata = {
  title: "IPPAN — Powering Nepal, Together",
  description:
    "The integrated digital platform for Nepal’s independent power producers. Membership, knowledge and a sustainable energy future.",
  icons: { icon: "/ippan/logo.png" },
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
