'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Printer, Minus, Plus, AlertTriangle } from 'lucide-react';
import { useGetMovimientoInventarioByIdQuery } from '@/hooks/movimiento-inventario';
import { useGetVariantesParaEtiquetasQuery } from '@/hooks/etiquetas';
import { useEtiquetaConfig } from '@/hooks/etiqueta-config';
import { EtiquetaPreview } from '@/components/etiqueta/etiqueta-preview';
import { codificarDatosEtiqueta, ItemEtiqueta } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

const LIMITE_ADVERTENCIA = 500;

function PrepararContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movimientoId = searchParams.get('movimientoId');
  const articuloIdsParam = searchParams.get('articuloIds');

  const articuloIds = React.useMemo(
    () => (articuloIdsParam ? articuloIdsParam.split(',').map(Number).filter(Boolean) : []),
    [articuloIdsParam],
  );

  const { data: movimiento } = useGetMovimientoInventarioByIdQuery(
    movimientoId ? Number(movimientoId) : 0,
  );
  const { data: variantesApi = [] } = useGetVariantesParaEtiquetasQuery(
    articuloIds.length > 0 ? articuloIds : [],
  );

  const { config } = useEtiquetaConfig();

  const [cantidades, setCantidades] = React.useState<Record<number, number>>({});
  const [varianteActiva, setVarianteActiva] = React.useState<VarianteEtiqueta | null>(null);
  const [inicializado, setInicializado] = React.useState(false);

  // Construir lista de variantes unificada
  const variantes: VarianteEtiqueta[] = React.useMemo(() => {
    if (movimientoId && movimiento?.detalles) {
      return movimiento.detalles
        .filter((d: any) => d.articuloVariante)
        .map((d: any) => ({
          articuloId: d.articuloVariante.articuloId,
          articuloNombre: d.articuloVariante.articulo?.nombre ?? '—',
          varianteId: d.articuloVariante.id,
          talleNombre: d.articuloVariante.talle?.nombre ?? '—',
          colorNombre: d.articuloVariante.color?.nombre ?? '—',
          codigoBarras: d.articuloVariante.codigoBarras ?? null,
        }));
    }
    return variantesApi;
  }, [movimientoId, movimiento, variantesApi]);

  // Inicializar cantidades
  React.useEffect(() => {
    if (inicializado || variantes.length === 0) return;
    const init: Record<number, number> = {};
    if (movimientoId && movimiento?.detalles) {
      movimiento.detalles
        .filter((d: any) => d.articuloVariante)
        .forEach((d: any) => {
          init[d.articuloVariante.id] = Math.max(0, parseInt(d.cantidad ?? '0', 10));
        });
    } else {
      variantes.forEach((v) => { init[v.varianteId] = 1; });
    }
    setCantidades(init);
    setVarianteActiva(variantes[0] ?? null);
    setInicializado(true);
  }, [variantes, movimientoId, movimiento, inicializado]);

  const setCantidad = (varianteId: number, valor: number) => {
    setCantidades((prev) => ({ ...prev, [varianteId]: Math.max(0, valor) }));
  };

  const totalEtiquetas = Object.values(cantidades).reduce((s, c) => s + c, 0);

  const imprimir = () => {
    const items: ItemEtiqueta[] = variantes
      .filter((v) => (cantidades[v.varianteId] ?? 0) > 0)
      .map((v) => ({ variante: v, cantidad: cantidades[v.varianteId] ?? 0 }));

    if (!items.length) return;

    const encoded = codificarDatosEtiqueta({ items, config });
    window.open(`/print/etiquetas?data=${encoded}`, '_blank');
  };

  // Agrupar por artículo
  const porArticulo = React.useMemo(() => {
    const mapa = new Map<number, { nombre: string; variantes: VarianteEtiqueta[] }>();
    variantes.forEach((v) => {
      if (!mapa.has(v.articuloId)) {
        mapa.set(v.articuloId, { nombre: v.articuloNombre, variantes: [] });
      }
      mapa.get(v.articuloId)!.variantes.push(v);
    });
    return Array.from(mapa.values());
  }, [variantes]);

  const origen = movimientoId
    ? `Movimiento #${movimientoId}`
    : `${articuloIds.length} artículo(s) seleccionado(s)`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle title="Preparar etiquetas" />
          <p className="text-sm text-muted-foreground mt-0.5">Origen: {origen}</p>
        </div>
        <div className="flex items-center gap-3">
          {totalEtiquetas > LIMITE_ADVERTENCIA && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{totalEtiquetas} etiquetas — puede demorar</span>
            </div>
          )}
          <Button disabled={totalEtiquetas === 0} onClick={imprimir}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir ({totalEtiquetas})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: variantes */}
        <div className="space-y-4">
          {porArticulo.map((grupo) => (
            <div key={grupo.nombre} className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-medium text-sm">{grupo.nombre}</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Talle</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Color</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Cant.</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.variantes.map((v) => (
                    <tr
                      key={v.varianteId}
                      className={`border-t cursor-pointer transition-colors ${
                        varianteActiva?.varianteId === v.varianteId
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/30'
                      }`}
                      onMouseEnter={() => setVarianteActiva(v)}
                      onClick={() => setVarianteActiva(v)}
                    >
                      <td className="px-4 py-2">{v.talleNombre}</td>
                      <td className="px-4 py-2">{v.colorNombre}</td>
                      <td className="px-4 py-2">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"
                            onClick={() => setCantidad(v.varianteId, (cantidades[v.varianteId] ?? 0) - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <Input
                            type="number"
                            min={0}
                            value={cantidades[v.varianteId] ?? 0}
                            onChange={(e) => setCantidad(v.varianteId, parseInt(e.target.value, 10) || 0)}
                            className="h-7 w-16 text-center px-1"
                          />
                          <button
                            type="button"
                            className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"
                            onClick={() => setCantidad(v.varianteId, (cantidades[v.varianteId] ?? 0) + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {porArticulo.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No hay variantes para mostrar
            </div>
          )}
        </div>

        {/* Panel derecho: preview */}
        <div className="space-y-3 lg:sticky lg:top-4 self-start">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Vista previa
          </h3>
          {varianteActiva ? (
            <div className="space-y-2">
              <EtiquetaPreview variante={varianteActiva} config={config} escala={3} />
              <p className="text-xs text-muted-foreground">
                {varianteActiva.articuloNombre} — T: {varianteActiva.talleNombre} / C:{' '}
                {varianteActiva.colorNombre}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
              Pasá el cursor sobre una variante
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EtiquetasPrepararPage() {
  return (
    <React.Suspense fallback={<div className="p-4 text-sm">Cargando...</div>}>
      <PrepararContent />
    </React.Suspense>
  );
}
