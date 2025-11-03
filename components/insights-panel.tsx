'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '@/components/transactions-store';

interface Insight {
  title: string;
  value: string;
  detail: string;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function computeInsights(transactions: ReturnType<typeof useTransactions>['transactions']): Insight[] {
  if (!transactions.length) {
    return [];
  }

  const categories = new Map<string, { credit: number; debit: number }>();
  const byHour = new Array(24).fill(0);

  for (const tx of transactions) {
    const bucket = categories.get(tx.category) ?? { credit: 0, debit: 0 };
    if (tx.kind === 'credit') {
      bucket.credit += tx.amount;
    } else {
      bucket.debit += tx.amount;
    }
    categories.set(tx.category, bucket);

    const hour = parseISO(tx.occurredAt).getHours();
    byHour[hour] += 1;
  }

  const sortedDebit = [...categories.entries()].sort((a, b) => b[1].debit - a[1].debit);
  const sortedCredit = [...categories.entries()].sort((a, b) => b[1].credit - a[1].credit);

  const busiestHour = byHour.reduce(
    (acc, value, hour) => (value > acc.count ? { hour, count: value } : acc),
    { hour: 0, count: 0 }
  );

  const newest = transactions[0];

  return [
    sortedDebit[0]
      ? {
          title: 'Top debit sink',
          value: sortedDebit[0][0],
          detail: currency.format(sortedDebit[0][1].debit)
        }
      : null,
    sortedCredit[0]
      ? {
          title: 'Primary credit source',
          value: sortedCredit[0][0],
          detail: currency.format(sortedCredit[0][1].credit)
        }
      : null,
    {
      title: 'Peak activity hour',
      value: `${String(busiestHour.hour).padStart(2, '0')}:00`,
      detail: `${busiestHour.count} movements`
    },
    newest
      ? {
          title: 'Latest recorded',
          value: newest.label,
          detail: format(parseISO(newest.occurredAt), 'PPPpp')
        }
      : null
  ].filter(Boolean) as Insight[];
}

export function InsightsPanel() {
  const { transactions } = useTransactions();
  const insights = useMemo(() => computeInsights(transactions), [transactions]);

  if (!insights.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Highlights</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Quick wins mined from your ledger.</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/60"
          >
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {insight.title}
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{insight.value}</dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">{insight.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
