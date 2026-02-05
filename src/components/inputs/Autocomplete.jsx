import React, { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus } from "lucide-react";

export default function Autocomplete({ id, value, onChange, options = [], placeholder = "", onCreateOption }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = (query || value || "").toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 50);
  }, [options, query, value]);

  const showCreate = query && !options.some((o) => o.toLowerCase() === query.toLowerCase());

  const handleSelect = (val) => {
    onChange?.(val);
    setQuery("");
    setOpen(false);
  };

  const handleCreate = () => {
    if (!query) return;
    onCreateOption?.(query);
    onChange?.(query);
    setOpen(false);
    setQuery("");
  };

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={query || value || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={() => setOpen((o) => !o)}>
          <ChevronsUpDown className="w-4 h-4" />
        </Button>
      </div>

      {open && (
        <Card className="absolute z-50 mt-2 w-full max-h-64 overflow-auto border-2">
          <div className="p-2">
            {filtered.length === 0 && !showCreate && (
              <div className="text-sm text-gray-500 p-2">Nenhum resultado</div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm"
              >
                {opt}
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-2 py-2 rounded bg-pink-50 text-pink-700 hover:bg-pink-100 text-sm mt-1"
              >
                <Plus className="w-4 h-4" /> Adicionar "{query}"
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}