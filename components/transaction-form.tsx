'use client';

import { useState } from 'react';
import { formatISO } from 'date-fns';
import { useTransactions } from '@/components/transactions-store';

const categories = [
  'General',
  'Food & Dining',
  'Housing',
  'Transportation',
  'Entertainment',
  'Savings',
  'Healthcare',
  'Utilities',
  'Travel',
  'Investments'
];

export function TransactionForm() {
  const { addTransaction } = useTransactions();
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [kind, setKind] = useState<'credit' | 'debit'>('credit');
  const [occurredAt, setOccurredAt] = useState(() => {
    return formatISO(new Date()).slice(0, 16);
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = label.trim();
    const numericAmount = Number(amount);

    if (!trimmed) {
      setError('Add a short label to remember this entry.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    if (!occurredAt) {
      setError('Pick when this happened.');
      return;
    }

    setError(null);

    addTransaction({
      label: trimmed,
      description: description.trim() || undefined,
      amount: Math.abs(numericAmount),
      kind,
      category,
      occurredAt: new Date(occurredAt).toISOString()
    });

    setLabel('');
    setDescription('');
    setAmount('');
    setKind('credit');
    setCategory('General');
    setOccurredAt(formatISO(new Date()).slice(0, 16));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Log a new event</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Credits lift your balance, debits consume it. Tags and precise timestamps make analytics richer.
          </p>
        </div>
      </header>

      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Card payment, subscription, bonus…"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1250.00"
            inputMode="decimal"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Flow type
          <select value={kind} onChange={(event) => setKind(event.target.value as 'credit' | 'debit')}>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional context, e.g. invoice number, card, or note"
            rows={3}
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Timestamp
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add to ledger
        </button>
      </div>
    </form>
  );
}
