import React, { useState } from 'react';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function NewTransactionForm({ onSuccess }) {
    const [type, setType] = useState('credit');
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');

    const submit = async () => {
        const wallet_id = 1;
        const payload = {
            wallet_id,
            type,
            amount: Number(amount),
            reference: reference || `REF-${Date.now()}`,
            idempotency_key: uuidv4(),
        };

        if (!payload.amount || payload.amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Unknown error' }));
                alert(err.message || 'Error');
                return;
            }

            const json = await res.json();
            setAmount('');
            setReference('');
            onSuccess(json);
        } catch (e) {
            alert('Network error');
        }
    };

    return (
        <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>New Transaction</div>
            <div style={{ margin: '6px 0' }}>
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }}>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <div style={{ margin: '6px 0' }}>
                <label>Amount</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }} />
            </div>
            <div style={{ margin: '6px 0' }}>
                <label>Reference</label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} style={{ display: 'block', width: '100%', padding: 4, marginTop: 2 }} />
            </div>
            <div style={{ margin: '6px 0' }}>
                <button onClick={() => setReference(`REF-${new Date().getFullYear()}-${Math.floor(Math.random()*100000).toString().padStart(5,'0')}`)} style={{ padding: '4px 8px', marginRight: 4 }}>Fill reference</button>
                <button onClick={submit} style={{ padding: '4px 8px' }}>Submit</button>
            </div>
        </div>
    );
}
