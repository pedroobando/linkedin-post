import { Geist, Geist_Mono, Montserrat_Alternates } from 'next/font/google';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const titleFont = Montserrat_Alternates({
  variable: '--font-montserrat',
  weight: ['500', '700'],
  subsets: ['latin'],
});
