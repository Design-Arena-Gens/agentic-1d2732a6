'use client';

import { Fragment } from 'react';
import { format, parseISO } from 'date-fns';
import classNames from 'classnames';
import type { Transaction } from '@/components/transactions-store';

interface TransactionTimelineProps {
  transactions: Transaction[];
}

function groupByDay(transactions: Transaction[]) {
  const buckets = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const day = format(parseISO(tx.occurredAt), 'yyyy-MM-dd');
    const entries = buckets.get(day) ?? [];
    entries.push(tx);
    buckets.set(day, entries);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([day, entries]) => ({ day, entries: entries.sort((a, b) => (a.occurredAt > b.occurredAt ? -1 : 1)) }));
}

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  if (!transactions.length) {
    return null;
  }

  const grouped = groupByDay(transactions.slice(0, 40));

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Timeline</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Recent 40 movements grouped by day. Spot streaks, bursts, and lulls instantly.
      </p>
      <ol className="mt-6 space-y-6">
        {grouped.map(({ day, entries }) => (
          <li key={day} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="h-1 w-1 rounded-full bg-indigo-500" />
              {format(new Date(day), 'EEEE, MMM d yyyy')}
            </div>
            <div className="relative border-l border-slate-200 pl-4 dark:border-slate-700">
              {entries.map((tx, index) => {
                const isCredit = tx.kind === 'credit';
                return (
                  <Fragment key={tx.id}>
                    <div className="mb-5">
                      <span className="absolute -left-[6px] block h-3 w-3 rounded-full border border-white bg-indigo-500 dark:border-slate-900" />
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{tx.label}</p>
                        <span
                          className={classNames(
                            'text-xs font-semibold',
                            isCredit ? 'text-emerald-500' : 'text-rose-500'
                          )}
                        >
                          {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(parseISO(tx.occurredAt), 'hh:mm a')} • {tx.category}
                      </p>
                      {tx.description ? (
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{tx.description}</p>
                      ) : null}
                    </div>
                    {index === entries.length - 1 ? null : (
                      <div className="mb-5 h-px w-full bg-slate-200 dark:bg-slate-800" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
