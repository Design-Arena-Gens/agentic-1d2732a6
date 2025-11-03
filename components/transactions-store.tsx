'use client';

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { nanoid } from 'nanoid/non-secure';
import { loadTransactions, persistTransactions } from '@/lib/storage';

export type TransactionKind = 'credit' | 'debit';

export interface Transaction {
  id: string;
  label: string;
  description?: string;
  amount: number;
  kind: TransactionKind;
  category: string;
  occurredAt: string;
  createdAt: string;
}

interface TransactionsState {
  transactions: Transaction[];
  lastSyncedAt?: string;
}

const initialState: TransactionsState = {
  transactions: []
};

type TransactionDraft = Omit<Transaction, 'id' | 'createdAt'>;

type TransactionsAction =
  | { type: 'add'; payload: TransactionDraft }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'hydrate'; payload: Transaction[] }
  | { type: 'purge' };

function reducer(state: TransactionsState, action: TransactionsAction): TransactionsState {
  switch (action.type) {
    case 'add': {
      const now = new Date().toISOString();
      const item: Transaction = {
        ...action.payload,
        id: nanoid(),
        createdAt: now
      };
      return {
        transactions: [item, ...state.transactions],
        lastSyncedAt: now
      };
    }
    case 'remove': {
      const filtered = state.transactions.filter((tx) => tx.id !== action.payload.id);
      return {
        transactions: filtered,
        lastSyncedAt: state.lastSyncedAt
      };
    }
    case 'hydrate':
      return {
        transactions: action.payload,
        lastSyncedAt: new Date().toISOString()
      };
    case 'purge':
      return initialState;
    default:
      return state;
  }
}

interface TransactionsContextValue extends TransactionsState {
  addTransaction: (draft: TransactionDraft) => void;
  removeTransaction: (id: string) => void;
  purge: () => void;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadTransactions().then((items) => {
      if (items.length) {
        dispatch({ type: 'hydrate', payload: items });
      }
    });
  }, []);

  useEffect(() => {
    persistTransactions(state.transactions);
  }, [state.transactions]);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      ...state,
      addTransaction: (draft) => dispatch({ type: 'add', payload: draft }),
      removeTransaction: (id) => dispatch({ type: 'remove', payload: { id } }),
      purge: () => dispatch({ type: 'purge' })
    }),
    [state]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return ctx;
}
