'use client';

import React from 'react';
import { Search, ArrowLeft, Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { buscarArticulos, fetchGrillaConPrecio } from '@/services/articulo-venta';
import { VentaDetalle, ArticuloVariante } from '@/types';
import { cn } from '@/lib/utils';

function fmt(v: number) {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PosArticuloBusquedaProps {
  listaPrecioId?: number;
  onAgregar: (detalle: Omit<VentaDetalle, 'id' | 'ventaId'>) => void;
}

export function PosArticuloBusqueda({ listaPrecioId, onAgregar }: PosArticuloBusquedaProps) {
  const [busqueda, setBusqueda] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [articuloId, setArticuloId] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(busqueda), 280);
    return () => clearTimeout(t);
  }, [busqueda]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [articuloId]);

  const { data: articulos = [], isFetching } = useQuery({
    queryKey: ['articulos-pos', debouncedSearch, listaPrecioId],
    queryFn: () => buscarArticulos(debouncedSearch, listaPrecioId),
    enabled: debouncedSearch.length >= 2,
  });

  const { data: grilla, isFetching: isFetchingGrilla } = useQuery({
    queryKey: ['grilla-pos', articuloId, listaPrecioId],
    queryFn: () => fetchGrillaConPrecio(articuloId!, listaPrecioId),
    enabled: !!articuloId,
  });

  const articuloSeleccionado = articulos.find((a) => a.id === articuloId);

  const agregarVariante = (varianteId: number, talleId: number, colorId: number, talleCodigo: string, colorCodigo: string) => {
    if (!articuloSeleccionado) return;
    const precio = articuloSeleccionado.precioDefault ?? 0;
    const variante: ArticuloVariante = {
      id: varianteId,
      articuloId: articuloId!,
      talleId,
      colorId,
      cantidad: '0',
      talle: { id: talleId, codigo: talleCodigo, nombre: talleCodigo, orden: 0 },
      color: { id: colorId, codigo: colorCodigo, nombre: colorCodigo },
      articulo: { id: articuloSeleccionado.id, nombre: articuloSeleccionado.nombre, sku: articuloSeleccionado.sku },
    };

    onAgregar({
      articuloVarianteId: varianteId,
      cantidad: '1',
      precioUnitario: precio.toFixed(2),
      subtotalLinea: precio.toFixed(2),
      articuloVariante: variante,
    });

    setArticuloId(null);
    setBusqueda('');
    setDebouncedSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const seleccionarArticulo = async (id: number) => {
    const articulo = articulos.find((a) => a.id === id);
    if (!articulo) return;
    setArticuloId(id);
  };

  React.useEffect(() => {
    if (!articuloId || !grilla) return;
    const esUnicaVariante =
      grilla.celdas.length === 1 ||
      (grilla.talles.length <= 1 && grilla.colores.length <= 1 && grilla.celdas.length === 1);
    if (esUnicaVariante) {
      const celda = grilla.celdas[0];
      if (celda?.varianteId) {
        agregarVariante(celda.varianteId, celda.talleId, celda.colorId, celda.talleCodigo, celda.colorCodigo);
      }
    }
  }, [grilla, articuloId]);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Search input - siempre visible */}
      <div className="p-3 border-b bg-muted/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {!articuloId ? (
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar artículo por nombre o código..."
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 pl-9 h-10">
              <button
                type="button"
                onClick={() => { setArticuloId(null); setBusqueda(''); setDebouncedSearch(''); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold truncate">{articuloSeleccionado?.nombre}</span>
              {articuloSeleccionado?.precioDefault != null && (
                <span className="text-sm font-bold text-primary ml-auto shrink-0">
                  ${fmt(articuloSeleccionado.precioDefault)}
                </span>
              )}
            </div>
          )}
          {(isFetching || isFetchingGrilla) && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {!articuloId && (
        <div className="min-h-[120px]">
          {debouncedSearch.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Package className="h-8 w-8 opacity-20" />
              <p className="text-sm">Escribí para buscar un artículo</p>
            </div>
          ) : articulos.length === 0 && !isFetching ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-muted-foreground">Sin resultados para "{debouncedSearch}"</p>
            </div>
          ) : (
            <div className="divide-y">
              {articulos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors group flex items-center justify-between gap-3"
                  onClick={() => seleccionarArticulo(a.id!)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.nombre}</p>
                    {a.codigo && <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.codigo}</p>}
                  </div>
                  {a.precioDefault != null && (
                    <span className="text-sm font-bold tabular-nums shrink-0 text-foreground">
                      ${fmt(a.precioDefault)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grilla de variantes inline */}
      {articuloId && grilla && grilla.celdas.length > 1 && (
        <div className="p-4">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `5rem repeat(${grilla.colores.length}, minmax(0, 1fr))` }}
          >
            {/* Headers de colores */}
            <div />
            {grilla.colores.map((c) => (
              <div key={c.id} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                {c.codigo}
              </div>
            ))}

            {/* Filas de talles */}
            {grilla.talles.map((talle) => (
              <React.Fragment key={talle.id}>
                <div className="flex items-center text-sm font-bold text-foreground pr-2">
                  {talle.codigo}
                </div>
                {grilla.colores.map((color) => {
                  const celda = grilla.celdas.find(
                    (c) => c.talleId === talle.id && c.colorId === color.id,
                  );
                  const stock = Number(celda?.cantidad ?? '0');
                  const vid = celda?.varianteId;
                  const disponible = !!vid && stock > 0;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      disabled={!disponible}
                      onClick={() => vid && agregarVariante(vid, talle.id ?? 0, color.id ?? 0, talle.codigo, color.codigo)}
                      className={cn(
                        'rounded-lg text-sm py-2.5 font-semibold text-center transition-all border',
                        disponible
                          ? 'bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary border-border cursor-pointer'
                          : 'bg-muted/20 text-muted-foreground/30 border-muted/30 cursor-not-allowed',
                      )}
                    >
                      {stock > 0 ? stock : '·'}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {articuloId && isFetchingGrilla && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
