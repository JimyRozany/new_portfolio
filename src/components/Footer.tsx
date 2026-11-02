import Link from "next/link";
import { contact, ux, type L } from "@/lib/content";

export default function Footer({ l, name, items }: { l: L; name: string; items: { id: string; label: string }[] }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-mark" aria-hidden>{name}</div>
        <div className="foot-row">
          <nav aria-label="footer" className="foot-links">
            {items.map((i) => <Link key={i.id} href={`/${l}#${i.id}`}>{i.label}</Link>)}
            <a href={contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} {name}</span>
            <a href="#top" className="link-u">{ux.backTop[l]} ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
