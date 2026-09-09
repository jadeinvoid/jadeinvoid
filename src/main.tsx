import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SiteApp } from './site/SiteApp'
import './styles.css'
import './site.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteApp />
  </StrictMode>,
)
