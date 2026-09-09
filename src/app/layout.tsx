import type { Metadata } from 'next';
import './globals.css';
import { isPresentationMode } from '@/lib/portal-mode';
export const metadata: Metadata = {
  title: { default: 'Simples Nacional | Maurício Rocha Contabilidade', template: '%s | Maurício Rocha' },
  description: 'Uma contabilidade próxima para sua empresa ir mais longe. Conte com a Maurício Rocha para entender seu negócio e cuidar do Simples Nacional.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" data-portal-mode={isPresentationMode()?'presentation':'production'}><body>{children}</body></html>;
}
