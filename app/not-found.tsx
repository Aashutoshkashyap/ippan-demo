import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ padding: "15vh 10vw" }}>
      <h1>Page not found</h1>
      <p>This page is not part of the IPPAN demo.</p>
      <Link href="/">Return to IPPAN</Link>
    </main>
  );
}
