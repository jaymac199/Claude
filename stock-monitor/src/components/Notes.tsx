import { useEffect, useRef, useState } from 'react';
import { STOCKS } from '../config/stocks';
import { useLocalStorage } from '../hooks/useLocalStorage';

type NotesMap = Record<string, string>;

export function Notes() {
  const [notes, setNotes] = useLocalStorage<NotesMap>('notes', {});

  return (
    <section className="card">
      <h3 className="section-title">Watchlist notes</h3>
      <p className="muted notes-hint">Saved locally in your browser — they persist across refreshes.</p>
      <div className="notes-grid">
        {STOCKS.map((s) => (
          <NoteEditor
            key={s.symbol}
            symbol={s.symbol}
            name={s.name}
            value={notes[s.symbol] ?? ''}
            onChange={(text) => setNotes((prev) => ({ ...prev, [s.symbol]: text }))}
          />
        ))}
      </div>
    </section>
  );
}

interface EditorProps {
  symbol: string;
  name: string;
  value: string;
  onChange: (text: string) => void;
}

function NoteEditor({ symbol, name, value, onChange }: EditorProps) {
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(text: string) {
    onChange(text);
    setSaved(false);
    clearTimeout(timer.current);
    // useLocalStorage persists immediately; this just confirms it for the user.
    timer.current = setTimeout(() => setSaved(true), 500);
  }

  return (
    <div className="note-editor">
      <div className="note-editor__head">
        <label htmlFor={`note-${symbol}`} className="note-editor__label">
          {symbol} <span className="muted">· {name}</span>
        </label>
        <span className={`save-indicator ${saved ? 'is-saved' : ''}`}>
          {saved ? 'Saved ✓' : 'Saving…'}
        </span>
      </div>
      <textarea
        id={`note-${symbol}`}
        className="note-editor__textarea"
        placeholder={`Your notes on ${name}…`}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={5}
      />
    </div>
  );
}
