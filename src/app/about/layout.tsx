import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acerca de | PowerMK',
  description: 'Conoce más sobre PowerMK y nuestra misión',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}