import Link from "next/link";

export const DISCORD_LINK = 'https://discord.gg/v5wB6bNHcn';

export default function Discord() {

    if(typeof window !== 'undefined') {
        window.location.replace(DISCORD_LINK)
    }

    return (
        <Link href={DISCORD_LINK} style={{textDecoration: 'none', color: 'black', textShadow: 'none', display: 'inline'}}>
            <h1>Redirecionando pro Discord...</h1>
            <p>Se você não for redirecionado(a) em alguns instantes, clique aqui.</p>
        </Link>
    )
}