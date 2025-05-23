// src/app/layout.tsx
'use client';

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
