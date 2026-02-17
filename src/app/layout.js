import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DesktopOnlyWrapper from "./DesktopOnlyWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Night Of The DEAD | High-Score Zombie Survival Web Game",
  description: "Test your reflexes in this intense desktop-first zombie shooter. Aim your crosshair, survive the horde, and climb the leaderboard. Play Night Of The DEAD now!",
  keywords: ["Zombie shooter", "web game", "browser game", "arcade shooter", "high score", "HTML5 game", "undead survival", "desktop gaming"],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen`}
      >
        <main>
          <DesktopOnlyWrapper>
            {children}
          </DesktopOnlyWrapper>
        </main>
      </body>
    </html>
  );
}
