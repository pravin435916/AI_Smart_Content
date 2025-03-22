import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.createElement('div')
root.id = '__smart__Content__Root__'
document.body.append(root)
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
