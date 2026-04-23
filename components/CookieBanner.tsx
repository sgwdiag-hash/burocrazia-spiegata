'use client'

import { useState, useEffect } from 'react'

type ConsentState = {
  analytics: boolean
  necessary: boolean
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem('capisci_cookie_consent')
    if (!saved) setVisible(true)
  }, [])

  const acceptAll = () => {
    localStorage.setItem('capisci_cookie_consent', JSON.stringify({ necessary: true, analytics: true }))
    localStorage.setItem('capisci_consent_date', new Date().toISOString())
    setVisible(false)
  }

  const rejectAll = () => {
    localStorage.setItem('capisci_cookie_consent', JSON.stringify({ necessary: true, analytics: false }))
    localStorage.setItem('capisci_consent_date', new Date().toISOString())
    setVisible(false)
  }

  const saveCustom = () => {
    localStorage.setItem('capisci_cookie_consent', JSON.stringify(consent))
    localStorage.setItem('capisci_consent_date', new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '1rem', right: '1rem',
      zIndex: 9999, maxWidth: '680px', margin: '0 auto',
    }}>
      <div style={{
        background: '#0A2540', color: '#F5F0E6', borderRadius: '12px',
        padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {!showDetails ? (
          <>
            <p style={{ margin: '0 0 0.4rem', fontSize: '15px', fontWeight: 500, fontFamily: 'Georgia, serif' }}>
              Utilizziamo i cookie
            </p>
            <p style={{ margin: '0 0 1.25rem', fontSize: '13px', color: '#A8B8C8', lineHeight: 1.6 }}>
              Usiamo cookie tecnici necessari e, con il tuo consenso, cookie analitici (Plausible — GDPR-compliant). Non vendiamo i tuoi dati.{' '}
              <a href="/privacy-policy" style={{ color: '#5A7D6B', textDecoration: 'underline' }}>Privacy Policy</a>
              {' · '}
              <a href="/cookie-policy" style={{ color: '#5A7D6B', textDecoration: 'underline' }}>Cookie Policy</a>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={acceptAll} style={{
                background: '#F5F0E6', color: '#0A2540', border: 'none', borderRadius: '6px',
                padding: '0.55rem 1.25rem', fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1, minWidth: '120px',
              }}>Accetta tutti</button>
              <button onClick={rejectAll} style={{
                background: 'transparent', color: '#F5F0E6', border: '1px solid #F5F0E6', borderRadius: '6px',
                padding: '0.55rem 1.25rem', fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1, minWidth: '120px',
              }}>Rifiuta tutti</button>
              <button onClick={() => setShowDetails(true)} style={{
                background: 'transparent', color: '#A8B8C8', border: '1px solid #3A5470', borderRadius: '6px',
                padding: '0.55rem 1.25rem', fontSize: '13px', cursor: 'pointer', flex: 1, minWidth: '120px',
              }}>Personalizza</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 1rem', fontSize: '15px', fontWeight: 500, fontFamily: 'Georgia, serif' }}>
              Preferenze cookie
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span>
                  <strong style={{ color: '#F5F0E6' }}>Cookie necessari</strong><br />
                  <span style={{ color: '#A8B8C8' }}>Autenticazione, sicurezza, sessione</span>
                </span>
                <span style={{ color: '#5A7D6B', fontSize: '12px' }}>Sempre attivi</span>
              </div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                <span>
                  <strong style={{ color: '#F5F0E6' }}>Cookie analitici</strong><br />
                  <span style={{ color: '#A8B8C8' }}>Plausible Analytics — nessun dato personale</span>
                </span>
                <input type="checkbox" checked={consent.analytics}
                  onChange={e => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#5A7D6B', cursor: 'pointer' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={saveCustom} style={{
                background: '#F5F0E6', color: '#0A2540', border: 'none', borderRadius: '6px',
                padding: '0.55rem 1.25rem', fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1,
              }}>Salva preferenze</button>
              <button onClick={() => setShowDetails(false)} style={{
                background: 'transparent', color: '#A8B8C8', border: '1px solid #3A5470', borderRadius: '6px',
                padding: '0.55rem 1.25rem', fontSize: '13px', cursor: 'pointer',
              }}>Indietro</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}