import React from 'react';

export default function TransactionsTable({ rows = [], summary = { total_in: 0, total_out: 0 }, meta = { page: 1, per_page: 10, total: 0 }, onPage }) {
    const nextPage = () => {
        const maxPage = Math.ceil((meta.total || 0) / (meta.per_page || 10)) || 1;
        if ((meta.page || 1) < maxPage) onPage((meta.page || 1) + 1);
    };

    const prevPage = () => {
        if ((meta.page || 1) > 1) onPage((meta.page || 1) - 1);
    };

    return (
        <div>
            <div style={{ margin: '6px 0' }}>
                <strong>Summary:</strong>
                <span style={{ marginLeft: 6 }}>{Number(summary.total_in || 0).toFixed(2)}</span>
                &nbsp;/&nbsp;
                <span>{Number(summary.total_out || 0).toFixed(2)}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: 6, textAlign: 'left' }}>Reference</th>
                        <th style={{ padding: 6, textAlign: 'left' }}>Type</th>
                        <th style={{ padding: 6, textAlign: 'left' }}>Amount</th>
                        <th style={{ padding: 6, textAlign: 'left' }}>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id || r.reference} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: 6 }}>{r.reference}</td>
                            <td style={{ padding: 6 }}>{r.type}</td>
                            <td style={{ padding: 6 }}>{Number(r.amount).toFixed(2)}</td>
                            <td style={{ padding: 6 }}>{new Date(r.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ margin: '6px 0' }}>
                <button onClick={prevPage} style={{ padding: '4px 8px', marginRight: 6 }}>Prev</button>
                <span style={{ margin: '0 8px' }}>{meta.page || 1}</span>
                <button onClick={nextPage} style={{ padding: '4px 8px' }}>Next</button>
            </div>
        </div>
    );
}
