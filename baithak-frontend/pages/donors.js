import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function Donors() {
  const [donors, setDonors] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [status, setStatus] = useState('')

  async function loadDonors() {
    const res = await fetch(`${API}/donors/`)
    const data = await res.json()
    setDonors(data)
  }

  useEffect(() => { loadDonors() }, [])

  async function handleSubmit() {
    if (!form.name.trim()) { setStatus('Name is required.'); return }
    try {
      const res = await fetch(`${API}/donors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      setForm({ name: '', phone: '', email: '', address: '' })
      setStatus('Donor added.')
      loadDonors()
    } catch {
      setStatus('Error adding donor.')
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 700, fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <a href="/" style={{ fontSize: 12 }}>← Back to Donations</a>
      </div>

      <fieldset style={{ border: '1px solid #adadad', padding: '8px 10px', marginBottom: 16 }}>
        <legend>Add Donor</legend>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div><label>Name *</label></div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: 160 }} />
          </div>
          <div>
            <div><label>Phone</label></div>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ width: 120 }} />
          </div>
          <div>
            <div><label>Email</label></div>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: 160 }} />
          </div>
          <div>
            <div><label>Address</label></div>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ width: 180 }} />
          </div>
          <button onClick={handleSubmit}>Add</button>
        </div>
        {status && (
          <div style={{ marginTop: 6, color: status.includes('Error') ? 'red' : 'green' }}>{status}</div>
        )}
      </fieldset>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e8e8e8' }}>
            {['Name', 'Phone', 'Email', 'Address'].map(h => (
              <th key={h} style={{ border: '1px solid #adadad', padding: '2px 6px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {donors.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 8, color: '#888' }}>No donors yet.</td></tr>
          ) : donors.map((d, i) => (
            <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }}>
              <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{d.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{d.phone}</td>
              <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{d.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{d.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
