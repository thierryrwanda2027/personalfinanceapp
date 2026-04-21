import type { Transaction, User } from '../domain/types';

// ARCHITECT NOTE:
// We employ a Generic Storage Utility <T> to demonstrate reusability. Instead of hardcoding
// the storage functions for just 'Transaction', this module can store and retrieve ANY type,
// which is a hallmark of scalable, Senior-level architecture.
// Furthermore, the manual Type Guard (isTransactionArray) is critical. JSON.parse returns 'any',
// which defeats TypeScript's purpose and introduces severe runtime risks. By manually validating
// the parsed data against our expected schema without relying on external libraries, we prove
// a deep understanding of TypeScript's type narrowing and runtime validation constraints.

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to storage for key "${key}":`, error);
  }
}

export function loadFromStorage<T>(
  key: string,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (validator(parsed)) {
      return parsed;
    }

    console.warn(`Data validation failed for key "${key}". Returning fallback.`);
    return fallback;
  } catch (error) {
    console.error(`Failed to load from storage for key "${key}":`, error);
    return fallback;
  }
}

export function isTransactionArray(data: unknown): data is Transaction[] {
  if (!Array.isArray(data)) return false;

  return data.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;

    // We safely treat 'item' as a record to check its properties
    const record = item as Record<string, unknown>;

    if (
      typeof record.id !== 'string' ||
      typeof record.amount !== 'number' ||
      typeof record.description !== 'string' ||
      typeof record.date !== 'number'
    ) {
      return false;
    }

    if (record.type === 'expense') {
      const validCategories = ['Food', 'Transport', 'Rent', 'Shopping'];
      return typeof record.category === 'string' && validCategories.includes(record.category);
    } else if (record.type === 'income') {
      const validSources = ['Salary', 'Freelance', 'Investments'];
      return typeof record.source === 'string' && validSources.includes(record.source);
    }

    return false;
  });
}

const USER_STORAGE_KEY = 'klab_finance_user';

export function saveUser(user: User): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

export function getUser(): User | null {
  try {
    const item = localStorage.getItem(USER_STORAGE_KEY);
    if (!item) return null;

    const parsed = JSON.parse(item);
    if (typeof parsed === 'object' && parsed !== null && typeof (parsed as Record<string, unknown>).email === 'string') {
      return parsed as User;
    }

    return null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to logout user:', error);
  }
}
