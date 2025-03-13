import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { Container } from '@mui/material';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Header />
              <Container component="div" sx={{ flexGrow: 1, py: 3 }}>
                {children}
              </Container>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}