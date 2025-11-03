'use client';

import { useMemo } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import classNames from 'classnames';
import { useTransactions } from '@/components/transactions-store';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

interface SummaryMetricProps {
  label: string;
  value: string;
  hint: string;
  accent?: 'positive' | 'negative' | 'neutral';
}

function SummaryMetric({ label, value, hint, accent = 'neutral' }: SummaryMetricProps) {
  return (
    <div
      className={classNames(
        'rounded-2xl border p-5 shadow-sm transition dark:border-slate-800',
        accent === 'positive' && 'border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-500/10',
        accent === 'negative' && 'border-rose-500/40 bg-rose-50/70 dark:bg-rose-500/10',
        accent === 'neutral' && 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      )}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function computeVelocity(transactions: ReturnType<typeof useTransactions>['transactions']) {
  if (!transactions.length) {
    return { avgCredit: 0, avgDebit: 0, dailyNet: 0 };
  }

  const sorted = [...transactions].sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1));
  const first = parseISO(sorted[0].occurredAt);
  const last = parseISO(sorted[sorted.length - 1].occurredAt);
  const span = Math.max(differenceInCalendarDays(last, first), 1);

  let credit = 0;
  let debit = 0;
  for (const tx of transactions) {
    if (tx.kind === 'credit') {
      credit += tx.amount;
    } else {
      debit += tx.amount;
    }
  }

  return {
    avgCredit: credit / span,
    avgDebit: debit / span,
    dailyNet: (credit - debit) / span
  };
}

export function SummaryCards() {
  const { transactions } = useTransactions();

  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;
    for (const tx of transactions) {
      if (tx.kind === 'credit') credit += tx.amount;
      else debit += tx.amount;
    }
    return {
      credit,
      debit,
      balance: credit - debit,
      lastActivity: transactions.length
        ? format(parseISO(transactions[0].occurredAt), 'PPPpp')
        : '—',
      metrics: computeVelocity(transactions)
    };
  }, [transactions]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryMetric
        label="Balance"
        value={summary.balance === 0 ? '$0.00' : currency.format(summary.balance)}
        hint="All credits minus debits"
        accent={summary.balance >= 0 ? 'positive' : 'negative'}
      />
      <SummaryMetric
        label="Total credited"
        value={currency.format(summary.credit)}
        hint="Lifetime inflow"
        accent="positive"
      />
      <SummaryMetric
        label="Total debited"
        value={currency.format(summary.debit)}
        hint="Lifetime outflow"
        accent="negative"
      />
      <SummaryMetric
        label="Latest activity"
        value={summary.lastActivity}
        hint={`Avg daily net ${currency.format(summary.metrics.dailyNet)}`}
      />
    </div>
  );
}
