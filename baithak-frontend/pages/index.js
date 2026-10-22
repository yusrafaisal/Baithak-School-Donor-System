import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

const PROJECTS = [
  'School Sponsorship', 'Student Sponsorship', 'Class Sponsorship',
  'Non-Formal Education', 'Orphan Support Program', 'Industrial Home',
  'Zabiha', 'Library', 'Water Cooler', 'Solar',
  'General Donation', 'General Zakat'
]

const ACCOUNTS = ['Income', 'Zakat Fund', 'Sadqah Fund', 'General Fund']
const COST_CENTERS = ['Head Office'] // expand after meeting

const today = () => new Date().toISOString().split('T')[0]

export default function Home() {
  const [activeTab, setActiveTab] = useState('donation')

  // Donation form state
  const [donors, setDonors] = useState([])
  const [form, setForm] = useState({
    date: today(),
    donor_id: '',
    payment_mode: 'cash',
    fund_receipt_no: '',
    voucher_no: '',
  })
  const [lineItem, setLineItem] = useState({
    amount: '0.00', account: '', cost_center: '', project: '', narration: ''
  })
  const [lineItems, setLineItems] = useState([])
  const [savedId, setSavedId] = useState(null)
  const [status, setStatus] = useState('')

  // Search state
  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    fetch(`${API}/donors/`)
      .then(r => r.json())
      .then(setDonors)
      .catch(() => {})
  }, [])

  function addLineItem() {
    if (!lineItem.amount || parseFloat(lineItem.amount) <= 0) {
      alert('Enter a valid amount'); return
    }
    if (!lineItem.project) { alert('Select a project'); return }
    setLineItems(prev => [...prev, { ...lineItem, sno: prev.length + 1 }])
    setLineItem({ amount: '0.00', account: '', cost_center: '', project: '', narration: '' })
  }

  function handleNew() {
    setForm({ date: today(), donor_id: '', payment_mode: 'cash', fund_receipt_no: '', voucher_no: '' })
    setLineItems([])
    setSavedId(null)
    setStatus('')
  }

  async function handleSave() {
    if (!form.donor_id) { alert('Select a donor'); return }
    if (lineItems.length === 0) { alert('Add at least one line item'); return }

    const payload = {
      ...form,
      line_items: lineItems.map(({ sno, ...rest }) => rest)
    }

    try {
      const res = await fetch(`${API}/donations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      setSavedId(data.id)
      setStatus('Saved successfully.')
    } catch {
      setStatus('Error saving donation.')
    }
  }

  async function handleDelete() {
    if (!savedId) { alert('No saved record to delete'); return }
    if (!confirm('Delete this receipt?')) return
    // endpoint can be added later
    setStatus('Delete not yet implemented.')
  }

  function handlePrint() {
    if (!savedId) { alert('Save first before printing'); return }
    window.open(`/receipt/${savedId}`, '_blank')
  }

  async function handleSearch() {
    const res = await fetch(`${API}/donations/?${searchName ? `donor_id=` : ''}`)
    const data = await res.json()
    setSearchResults(data)
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <div style={{ marginBottom: 8 }}>
        <a href="/donors" style={{ fontSize: 12 }}>Manage Donors</a>
      </div>    
      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: -1 }}>
        {['donation', 'search'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '4px 16px',
              border: '1px solid #adadad',
              borderBottom: activeTab === tab ? '1px solid #f0f0f0' : '1px solid #adadad',
              background: activeTab === tab ? '#f0f0f0' : '#d4d0c8',
              cursor: 'pointer',
              marginRight: 2,
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              zIndex: activeTab === tab ? 1 : 0,
              position: 'relative',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab Panel */}
      <div style={{ border: '1px solid #adadad', background: '#f0f0f0', padding: 12 }}>

        {/* ── DONATION TAB ── */}
        {activeTab === 'donation' && (
          <div>
            {/* Row 1: Date, Donor, Fund Receipt, Voucher, Payment Mode */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 10 }}>
              <div>
                <div><label>Date</label></div>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: 110 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div><label>Donors</label></div>
                <select
                  value={form.donor_id}
                  onChange={e => setForm(f => ({ ...f, donor_id: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Donor --</option>
                  {donors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div><label>Fund Receipt No</label></div>
                <input
                  value={form.fund_receipt_no}
                  onChange={e => setForm(f => ({ ...f, fund_receipt_no: e.target.value }))}
                  style={{ width: 100 }}
                />
              </div>
              <div>
                <div><label>Voucher No</label></div>
                <input
                  value={form.voucher_no}
                  onChange={e => setForm(f => ({ ...f, voucher_no: e.target.value }))}
                  style={{ width: 100 }}
                />
              </div>
              <div style={{ border: '1px solid #adadad', padding: '4px 10px', background: '#fff', display: 'flex', gap: 12, alignItems: 'center', height: 46 }}>
                {['cash', 'cheque', 'online'].map(mode => (
                  <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment_mode"
                      value={mode}
                      checked={form.payment_mode === mode}
                      onChange={() => setForm(f => ({ ...f, payment_mode: mode }))}
                    />
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Details group */}
            <fieldset style={{ border: '1px solid #adadad', padding: '6px 8px', marginBottom: 8 }}>
              <legend style={{ fontSize: 12 }}>Details</legend>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div>
                  <div><label>Amount</label></div>
                  <input
                    type="number"
                    value={lineItem.amount}
                    onChange={e => setLineItem(l => ({ ...l, amount: e.target.value }))}
                    style={{ width: 80 }}
                    step="0.01"
                  />
                </div>
                <div>
                  <div><label>Account</label></div>
                  <select
                    value={lineItem.account}
                    onChange={e => setLineItem(l => ({ ...l, account: e.target.value }))}
                    style={{ width: 140 }}
                  >
                    <option value="">--</option>
                    {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div><label>Schools/CostCenter</label></div>
                  <select
                    value={lineItem.cost_center}
                    onChange={e => setLineItem(l => ({ ...l, cost_center: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    <option value="">--</option>
                    {COST_CENTERS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div><label>SponsorProjects</label></div>
                  <select
                    value={lineItem.project}
                    onChange={e => setLineItem(l => ({ ...l, project: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    <option value="">--</option>
                    {PROJECTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Narration + Add button */}
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div><label>Narration</label></div>
                  <textarea
                    value={lineItem.narration}
                    onChange={e => setLineItem(l => ({ ...l, narration: e.target.value }))}
                    style={{ width: '100%', height: 48 }}
                  />
                </div>
                <button onClick={addLineItem} style={{ width: 36, minWidth: 36, fontSize: 16, marginBottom: 2 }}>+</button>
              </div>
            </fieldset>

            {/* Line items grid */}
            <div style={{ border: '1px solid #adadad', background: '#c0c0c0', marginBottom: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#e8e8e8' }}>
                    {['S.No', 'CostCenterName', 'AccountName', 'ProjectName', 'Amount', 'Narration'].map(h => (
                      <th key={h} style={{ border: '1px solid #adadad', padding: '2px 6px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr><td colSpan={6} style={{ height: 120, background: '#c0c0c0' }}></td></tr>
                  ) : lineItems.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{item.sno}</td>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{item.cost_center}</td>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{item.account}</td>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{item.project}</td>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{parseFloat(item.amount).toFixed(2)}</td>
                      <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{item.narration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status */}
            {status && <div style={{ marginBottom: 6, color: status.includes('Error') ? 'red' : 'green' }}>{status}</div>}

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button onClick={handleNew}>New</button>
              <button onClick={handleSave}>Save</button>
              <button onClick={handlePrint}>Print Receipt</button>
              <button onClick={handleDelete}>Delete Receipt</button>
            </div>
          </div>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === 'search' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
              <div>
                <div><label>Donor Name</label></div>
                <input value={searchName} onChange={e => setSearchName(e.target.value)} style={{ width: 200 }} />
              </div>
              <button onClick={handleSearch}>Search</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#e8e8e8' }}>
                  {['Date', 'Donor', 'Total', 'Payment Mode', 'Receipt No'].map(h => (
                    <th key={h} style={{ border: '1px solid #adadad', padding: '2px 6px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 8, color: '#888' }}>No results</td></tr>
                ) : searchResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{r.date}</td>
                    <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{r.donor_id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{r.total}</td>
                    <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{r.payment_mode}</td>
                    <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>{r.fund_receipt_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
