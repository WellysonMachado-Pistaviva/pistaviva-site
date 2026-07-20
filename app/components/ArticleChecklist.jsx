'use client';

import { useCallback, useSyncExternalStore } from 'react';

const EVENT = 'pistaviva:checklist';

export default function ArticleChecklist({ items, storageKey }) {
  const defaults = JSON.stringify(items.map(item => item.checked));

  const subscribe = useCallback((onChange) => {
    const listener = event => {
      if (!event.detail || event.detail === storageKey) onChange();
    };
    window.addEventListener(EVENT, listener);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, listener);
      window.removeEventListener('storage', onChange);
    };
  }, [storageKey]);

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) || defaults,
    [defaults, storageKey],
  );
  const getServerSnapshot = useCallback(() => defaults, [defaults]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let checked;
  try {
    const stored = JSON.parse(snapshot);
    checked = items.map((item, index) => Boolean(stored[index] ?? item.checked));
  } catch {
    checked = items.map(item => item.checked);
  }

  const toggle = index => {
    const next = checked.map((value, itemIndex) => itemIndex === index ? !value : value);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: storageKey }));
  };

  return (
    <ul className="art-checklist" aria-label="Checklist da matéria">
      {items.map((item, index) => (
        <li key={`${index}-${item.text}`} className={checked[index] ? 'is-checked' : ''}>
          <label>
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={() => toggle(index)}
            />
            <span>{item.text}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
