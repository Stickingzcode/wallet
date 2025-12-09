import React, { useState } from 'react';

export default function Filters({ onChange }) {
    const [q, setQ] = useState('');
    const [type, setType] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    return (
        <div>
            <div style={{ margin: '4px 0' }}>
                <label>Search</label>
                <input placeholder="Reference" value={q} onChange={(e) => setQ(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }} />
            </div>
            <div style={{ margin: '4px 0' }}>
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }}>
                    <option value="">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <div style={{ margin: '4px 0' }}>
                <label>From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }} />
            </div>
            <div style={{ margin: '4px 0' }}>
                <label>To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }} />
            </div>
            <button onClick={() => onChange({ q, type, from, to })} style={{ padding: '4px 8px', marginTop: 6 }}>Apply</button>
        </div>
    );
}
