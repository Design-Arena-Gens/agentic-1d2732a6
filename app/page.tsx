'use client';

import { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { TransactionsProvider, useTransactions } from '@/components/transactions-store';
import { TransactionForm } from '@/components/transaction-form';
import { SummaryCards } from '@/components/summary-cards';
import { FilterPanel, type TransactionFilters } from '@/components/filter-panel';
import { TransactionsTable } from '@/components/transactions-table';
import { TransactionTimeline } from '@/components/transaction-timeline';
import { InsightsPanel } from '@/components/insights-panel';

function useFiltered(filters: TransactionFilters) {
  const { transactions } = useTransactions();

  return useMemo(() => {
    const query = filters.search.toLowerCase();
    return transactions.filter((tx) => {
      if (filters.kind !== 'all' && tx.kind !== filters.kind) {
        return false;
      }

      if (filters.category !== 'all' && tx.category !== filters.category) {
        return false;
      }

      if (filters.from) {
        const from = parseISO(filters.from);
        if (parseISO(tx.occurredAt) < from) {
          return false;
        }
      }

      if (filters.to) {
        const to = parseISO(filters.to + 'T23:59:59.999Z');
        if (parseISO(tx.occurredAt) > to) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      const haystack = `${tx.label} ${tx.description ?? ''} ${tx.category}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [transactions, filters]);
}

function LedgerView() {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    kind: 'all',
    category: 'all'
  });
  const { transactions, removeTransaction, purge } = useTransactions();
  const filtered = useFiltered(filters);
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((tx) => tx.category))).sort(),
    [transactions]
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">PulseLedger</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Unified credit & debit intelligence
            </h1>
            <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Capture every inflow and outflow with precise timestamps. Slice the ledger by category, flow type,
              and moment to uncover patterns that keep your finances intentional.
            </p>
          </header>

          <SummaryCards />
          <TransactionForm />

          <FilterPanel
            filters={filters}
            onChange={setFilters}
            categories={categories}
            hasData={Boolean(transactions.length)}
          />

          <TransactionsTable transactions={filtered} onRemove={removeTransaction} />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear the entire ledger? This cannot be undone.')) {
                purge();
              }
            }}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
          >
            Clear ledger
          </button>
          <InsightsPanel />
          <TransactionTimeline transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <TransactionsProvider>
      <LedgerView />
    </TransactionsProvider>
  );
}
