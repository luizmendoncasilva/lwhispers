import type { Metadata } from "next";
import { spaceGrotesk, jetBrainsMono, inter } from "@/lib/theme";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "L.whispers",
  description: "Painel pessoal de demandas, tarefas e ciclos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} ${inter.variable}`}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
