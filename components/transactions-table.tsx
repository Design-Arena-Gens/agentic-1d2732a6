'use client';

import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import classNames from 'classnames';
import type { Transaction } from '@/components/transactions-store';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

interface TransactionsTableProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}

export function TransactionsTable({ transactions, onRemove }: TransactionsTableProps) {
  if (!transactions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-inner dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Nothing logged yet. Add credits and debits to start mapping your cash pulse.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Event</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Flow</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-left">When</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {transactions.map((tx) => {
            const occurred = parseISO(tx.occurredAt);
            const isCredit = tx.kind === 'credit';
            return (
              <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-50">{tx.label}</div>
                  {tx.description ? (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tx.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{tx.category}</td>
                <td className="px-4 py-4">
                  <span
                    className={classNames(
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                      isCredit
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                    )}
                  >
                    {isCredit ? 'Credit' : 'Debit'}
                  </span>
                </td>
                <td className={classNames('px-4 py-4 text-right text-sm font-semibold', isCredit ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300')}>
                  {isCredit ? '+' : '-'}
                  {currency.format(tx.amount)}
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                  <div>{format(occurred, 'MMM d, yyyy • hh:mm a')}</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{formatDistanceToNowStrict(occurred, { addSuffix: true })}</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => onRemove(tx.id)}
                    className="text-xs font-medium text-rose-500 hover:text-rose-400 dark:text-rose-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
