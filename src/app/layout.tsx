// src/app/layout.tsx
'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light" theme={{primaryColor: 'blue'}}>
          <ModalsProvider>
            <Notifications/>
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
