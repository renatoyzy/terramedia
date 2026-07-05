import styles from "@/layout/MainLayout.module.css"
import { useRouter } from "next/router";
import Link from "next/link";
import { DISCORD_LINK } from "@/pages/discord";
import Image from "next/image";

/**
 * Layout principal do site
 * @param {Object} properties
 * @param {Element} properties.children - Elementos dentro do main layout
 * @returns {JSX.Element} Componente MainLayout
 */
export default function MainLayout({ children }) {
    const router = useRouter();

    const navLinks = [
        { href: DISCORD_LINK, label: "Discord", target: "_blank", rel: "noopener noreferrer" },
        { href: "/shop", label: "Loja" },
        { href: "/", label: "Início" },
        { href: "/terms", label: "Termos" },
        { href: "/privacy", label: "Privacidade" },
    ];

    return (
        <>
            <header className={styles.header}>
                <h1><Image src={'/favicon.png'} width={32} height={32} /> Cubópolis</h1>

                <nav>
                    {navLinks.map(link => (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            className={
                                router.pathname === link.href
                                    ? `${styles.navLink} ${styles.navLinkActive}`
                                    : styles.navLink
                            }
                            target={link.target ? link.target : undefined}
                            rel={link.rel ? link.rel : undefined}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

            </header>

            <main className={styles.main}>
                {children}
            </main>
        </>
    )
}