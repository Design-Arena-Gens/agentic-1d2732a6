'use client';

import { useId } from 'react';
import classNames from 'classnames';
import type { TransactionKind } from '@/components/transactions-store';

export interface TransactionFilters {
  search: string;
  kind: TransactionKind | 'all';
  category: string | 'all';
  from?: string;
  to?: string;
}

interface FilterPanelProps {
  filters: TransactionFilters;
  onChange: (value: TransactionFilters) => void;
  categories: string[];
  hasData: boolean;
}

export function FilterPanel({ filters, onChange, categories, hasData }: FilterPanelProps) {
  const searchId = useId();
  const categoryId = useId();
  const typeId = useId();

  function update(partial: Partial<TransactionFilters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Explore</h3>
        <button
          type="button"
          onClick={() =>
            onChange({ search: '', kind: 'all', category: 'all', from: undefined, to: undefined })
          }
          className={classNames(
            'text-sm font-medium text-indigo-600 transition hover:text-indigo-500',
            !hasData && 'pointer-events-none opacity-40'
          )}
          disabled={!hasData}
        >
          Reset filters
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label htmlFor={searchId} className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Search
          <input
            id={searchId}
            type="search"
            placeholder="Find by label or note"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </label>

        <label htmlFor={typeId} className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Flow type
          <select
            id={typeId}
            value={filters.kind}
            onChange={(event) => update({ kind: event.target.value as TransactionFilters['kind'] })}
          >
            <option value="all">All</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
        </label>

        <label htmlFor={categoryId} className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Category
          <select
            id={categoryId}
            value={filters.category}
            onChange={(event) => update({ category: event.target.value as TransactionFilters['category'] })}
          >
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <label className="flex flex-col gap-1">
            From
            <input
              type="date"
              value={filters.from ?? ''}
              onChange={(event) => update({ from: event.target.value || undefined })}
            />
          </label>
          <label className="flex flex-col gap-1">
            To
            <input
              type="date"
              value={filters.to ?? ''}
              onChange={(event) => update({ to: event.target.value || undefined })}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
