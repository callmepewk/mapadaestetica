import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrendListModal({ open, onOpenChange, items }) {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (items || []).slice(start, start + pageSize);
  }, [items, page]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Todos os termos (máx. 10 por página)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {pageItems.length === 0 ? (
            <p className="text-sm text-gray-500">Sem itens</p>
          ) : (
            pageItems.map(it => (
              <div key={it.term} className="flex items-center justify-between border-b pb-2">
                <div className="font-medium">{it.term}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{it.count} buscas</Badge>
                  {it.growth != null && (
                    <Badge className={`${it.growth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{it.growth >= 0 ? '+' : ''}{Math.round(it.growth*100)}%</Badge>
                  )}
                </div>
              </div>
            ))
          )}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}