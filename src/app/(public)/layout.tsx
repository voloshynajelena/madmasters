import { type ReactNode } from 'react';
import { Header } from '@/components/layout/header';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header locale="en" />
      <main>{children}</main>
    </>
  );
}
