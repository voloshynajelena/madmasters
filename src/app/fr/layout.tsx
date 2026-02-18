import { type ReactNode } from 'react';
import { Header } from '@/components/layout/header';

interface FrenchLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: {
    default: 'Mad Masters — Studio de Produits Digitaux',
    template: '%s | Mad Masters',
  },
  description:
    'Nous créons des sites web, applications et expériences digitales à fort taux de conversion.',
  openGraph: {
    locale: 'fr_FR',
  },
};

export default function FrenchLayout({ children }: FrenchLayoutProps) {
  return (
    <>
      <Header locale="fr" />
      <main>{children}</main>
    </>
  );
}
