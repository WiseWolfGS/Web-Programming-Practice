// src/components/Footer.tsx

interface FooterProps {
    developerEmail: string;
    developerInstaNickname: string;
}

export default function Footer({ developerEmail, developerInstaNickname }: FooterProps) {
    return (
        <footer className="app-footer">
            <p>Email: <a href="#">{developerEmail}</a></p>
            <p>Instagram: <a href="#">{developerInstaNickname}</a></p>
            <p>&copy; 2025 GA-Life Project. All rights reserved.</p>
        </footer>
    )
}