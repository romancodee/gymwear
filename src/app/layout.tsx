// app/layout.tsx
import './globals.css';
import { CartProvider } from './context/cartcontext';
import LayoutWrapper from './components/layoutWraper';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Your Site',
  description: 'Your Description',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
