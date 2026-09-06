import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/provider.tsx'
import './index.css'
import { AppRouter } from './app/router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
