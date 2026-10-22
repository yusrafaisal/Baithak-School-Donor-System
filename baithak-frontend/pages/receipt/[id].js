import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function Receipt() {
  const { query } = useRouter()
  const [donation, setDonation] = useState(null)

  useEffect(() => {
    if (!query.id) return
    fetch(`${API}/donations/${query.id}`)
      .then(r => r.json())
      .then(setDonation)
  }, [query.id])

  if (!donation) return <p style={{ fontFamily: 'Tahoma', padding: 20 }}>Loading...</p>

  const total = donation.line_items.reduce((s, i) => s + i.amount, 0)

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 12, padding: 30, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Baithak School Network</h2>
        <p style={{ margin: 0 }}>Donation Receipt</p>
      </div>

      <table style={{ width: '100%', marginBottom: 12 }}>
        <tbody>
          <tr>
            <td><strong>Date:</strong> {donation.date}</td>
            <td><strong>Receipt No:</strong> {donation.fund_receipt_no || '—'}</td>
          </tr>
          <tr>
            <td><strong>Voucher No:</strong> {donation.voucher_no || '—'}</td>
            <td><strong>Payment:</strong> {donation.payment_mode}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            {['#', 'Project', 'Account', 'Cost Center', 'Amount', 'Narration'].map(h => (
              <th key={h} style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {donation.line_items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{i + 1}</td>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.project}</td>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.account}</td>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.cost_center}</td>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.amount.toFixed(2)}</td>
              <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.narration}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ textAlign: 'right', padding: '4px 6px' }}><strong>Total:</strong></td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}><strong>{total.toFixed(2)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
        <div style={{ borderTop: '1px solid #000', width: 160, textAlign: 'center', paddingTop: 4 }}>Authorized Signature</div>
        <div style={{ borderTop: '1px solid #000', width: 160, textAlign: 'center', paddingTop: 4 }}>Donor Signature</div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ fontFamily: 'Tahoma', fontSize: 12 }}>Print</button>
      </div>

      <style>{`@media print { button { display: none; } }`}</style>
    </div>
  )
}
