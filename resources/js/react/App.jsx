import React, { useEffect, useState, useCallback } from 'react';
import NewTransactionForm from './components/NewTransactionForm';
import Filters from './components/Filters';
import TransactionsTable from './components/TransactionsTable';

function buildUrl(params = {}) {
    const url = new URL('/api/transactions', window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
}

export default function App() {
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ total_in: 0, total_out: 0 });
    const [meta, setMeta] = useState({ total: 0, page: 1, per_page: 10 });
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const fetchAndRender = useCallback(async (opts = {}) => {
        const page = opts.page || meta.page || 1;
        if (opts.q !== undefined) setQuery(opts.q);
        if (opts.type !== undefined) setType(opts.type);
        if (opts.from !== undefined) setFrom(opts.from);
        if (opts.to !== undefined) setTo(opts.to);

        const url = buildUrl({ page, per_page: 10, q: opts.q ?? query, type: opts.type ?? type, from: opts.from ?? from, to: opts.to ?? to });
        const res = await fetch(url);
        const json = await res.json();
        setRows(json.data || []);
        setSummary(json.summary || { total_in: 0, total_out: 0 });
        setMeta(json.meta || { total: 0, page: 1, per_page: 10 });
    }, [query, type, from, to, meta.page]);

    useEffect(() => {
        fetchAndRender({});
    }, []);

    return (
        <div>
            <div style={{ backgroundColor: 'white', padding: 10, marginBottom: 10 }}>
                <NewTransactionForm onSuccess={(data) => {
                    const item = data.transaction;
                    setRows(prev => [item, ...prev]);
                    // refresh summary
                    fetchAndRender({});
                }} />
            </div>

            <div style={{ backgroundColor: 'white', padding: 10, marginBottom: 10 }}>
                <Filters onChange={(f) => fetchAndRender(f)} />
            </div>

            <TransactionsTable rows={rows} summary={summary} meta={meta} onPage={(p) => fetchAndRender({ page: p })} />
        </div>
    );
}
