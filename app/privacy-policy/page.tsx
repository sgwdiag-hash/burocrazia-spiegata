export const metadata = {
  title: 'Cookie Policy — Capisci.',
}

export default function CookiePolicyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'Georgia, serif', color: '#1A1A1A', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem' }}>Cookie Policy</h1>
      <p style={{ color: '#4A4A4A', fontSize: '0.9rem', marginBottom: '3rem' }}>Ultimo aggiornamento: 23 aprile 2026</p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem', borderBottom: '1px solid #E8DFD1', paddingBottom: '0.5rem' }}>Cookie tecnici necessari</h2>
        <p>Questi cookie sono indispensabili per il funzionamento del sito. Non richiedono consenso.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#F5F0E6' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Cookie</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Scopo</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Durata</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['capisci_session', 'Sessione autenticazione utente', 'Sessione'],
              ['capisci_cookie_consent', 'Memorizza le tue preferenze cookie', '12 mesi'],
              ['capisci_consent_date', 'Data del consenso (audit trail)', '12 mesi'],
            ].map(([name, scope, duration], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E8DFD1' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{name}</td>
                <td style={{ padding: '0.75rem', color: '#4A4A4A' }}>{scope}</td>
                <td style={{ padding: '0.75rem', color: '#4A4A4A' }}>{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem', borderBottom: '1px solid #E8DFD1', paddingBottom: '0.5rem' }}>Cookie analitici (con consenso)</h2>
        <p>Utilizziamo <strong>Plausible Analytics</strong> — una soluzione GDPR-compliant che non utilizza cookie di profilazione e non raccoglie dati personali identificabili.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#F5F0E6' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Servizio</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Scopo</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E8DFD1' }}>Privacy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: 500 }}>Plausible Analytics</td>
              <td style={{ padding: '0.75rem', color: '#4A4A4A' }}>Statistiche aggregate vissite (nessun dato personale)</td>
              <td style={{ padding: '0.75rem' }}><a href="https://plausible.io/privacy" style={{ color: '#5A7D6B' }}>plausible.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem', borderBottom: '1px solid #E8DFD1', paddingBottom: '0.5rem' }}>Gestire le preferenze</h2>
        <p>Puoi modificare le tue preferenze cookie in qualsiasi momento cliccando su "Gestisci Cookie" nel footer del sito.</p>
      </section>
    </main>
  )
}