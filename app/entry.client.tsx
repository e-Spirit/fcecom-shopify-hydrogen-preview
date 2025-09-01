import {RemixBrowser} from '@remix-run/react';
import {startTransition} from 'react';
import {createRoot} from 'react-dom/client';
import type {Container} from 'react-dom/client';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import muiTheme from '~/styles/mui-theme';

// Starte die Hydration mit MUI + StyleX Integration
if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    createRoot(document as unknown as Container).render(
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <RemixBrowser />
      </ThemeProvider>,
    );
  });
}
