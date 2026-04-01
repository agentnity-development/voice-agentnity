import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export type SearchableOption = {
  label: string;
  value: string;
  category?: string;
};

type SearchableSelectProps = {
  allowCustomValue?: boolean;
  disabled?: boolean;
  emptyMessage: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  value: string;
};

export default function SearchableSelect({
  allowCustomValue = false,
  disabled = false,
  emptyMessage,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  value,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trimmedQuery = query.trim();

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = trimmedQuery.toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.category ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, trimmedQuery]);

  const canUseCustomValue = useMemo(() => {
    if (!allowCustomValue || !trimmedQuery) {
      return false;
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    return !options.some((option) => option.label.toLowerCase() === normalizedQuery || option.value.toLowerCase() === normalizedQuery);
  }, [allowCustomValue, options, trimmedQuery]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-white text-sm rounded-xl px-4 py-3 flex items-center justify-between transition-all focus:outline-none focus:border-blue-500/40 disabled:opacity-50"
      >
        <span className={`font-medium truncate ${value ? 'text-white' : 'text-gray-500'}`}>
          {selectedOption?.label || value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d0d22] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 z-20">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canUseCustomValue) {
                    event.preventDefault();
                    onChange(trimmedQuery);
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {canUseCustomValue && (
              <button
                type="button"
                onClick={() => {
                  onChange(trimmedQuery);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-start justify-between gap-3 text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <span className="min-w-0 block truncate">Use &quot;{trimmedQuery}&quot;</span>
              </button>
            )}
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-start justify-between gap-3 ${value === option.value ? 'bg-blue-500/15 text-blue-300' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.category && (
                      <span className="block text-[11px] text-gray-500 mt-0.5 truncate">{option.category}</span>
                    )}
                  </span>
                  {value === option.value && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
