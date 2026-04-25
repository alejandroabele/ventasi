'use client';

import React from 'react';
import { Articulo } from '@/types';
import { useGetGrillaQuery, useActualizarCodigoBarrasMutation } from '@/hooks/articulo-variantes';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EtiquetaPreview } from '@/components/etiqueta/etiqueta-preview';
import { useEtiquetaConfig } from '@/hooks/etiqueta-config';
import { generarCodigoBarras } from '@/lib/etiqueta';

interface GrillaCodigosBarrasProps {
  articulo: Articulo;
}

export function GrillaCodigosBarras({ articulo }: GrillaCodigosBarrasProps) {
  const { data: grilla } = useGetGrillaQuery(articulo.id!);
  const { mutateAsync: guardar } = useActualizarCodigoBarrasMutation();
  const { toast } = useToast();
  const { config } = useEtiquetaConfig();

  const [valores, setValores] = React.useState<Record<number, string>>({});
  const [baseline, setBaseline] = React.useState<Record<number, string>>({});

  const celdas = (grilla?.celdas ?? []).filter((c) => c.estado === 'real' && c.varianteId);

  React.useEffect(() => {
    if (!celdas.length) return;
    const init: Record<number, string> = {};
    celdas.forEach((c) => {
      init[c.varianteId!] = c.codigoBarras ?? '';
    });
    setValores(init);
    setBaseline(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grilla]);

  const cambiarValor = (varianteId: number, valor: string) => {
    setValores((prev) => ({ ...prev, [varianteId]: valor }));
  };

  const guardarCodigo = async (varianteId: number) => {
    const actual = valores[varianteId] ?? '';
    const original = baseline[varianteId] ?? '';
    if (actual === original) return;
    try {
      await guardar({
        articuloId: articulo.id!,
        varianteId,
        codigoBarras: actual.trim() || null,
      });
      setBaseline((prev) => ({ ...prev, [varianteId]: actual }));
      toast({ title: 'Código de barras guardado' });
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
      setValores((prev) => ({ ...prev, [varianteId]: original }));
    }
  };

  if (!celdas.length) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No hay variantes con stock registrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Ingresá el código de barras del proveedor por variante. Si lo dejás vacío, el sistema genera uno automáticamente.
      </p>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Talle</th>
              <th className="px-4 py-2.5 text-left font-medium">Color</th>
              <th className="px-4 py-2.5 text-left font-medium w-56">Código de barras</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Auto-generado</th>
              <th className="px-4 py-2.5 text-left font-medium">Vista previa</th>
            </tr>
          </thead>
          <tbody>
            {celdas.map((celda) => {
              const varianteId = celda.varianteId!;
              const valor = valores[varianteId] ?? '';
              const variante = {
                articuloId: articulo.id!,
                articuloNombre: articulo.nombre,
                varianteId,
                talleNombre: celda.talleNombre,
                colorNombre: celda.colorNombre,
                codigoBarras: valor.trim() || null,
              };
              const codigoAuto = generarCodigoBarras({ ...variante, codigoBarras: null });
              const usandoPropio = valor.trim() !== '';

              return (
                <tr key={varianteId} className="border-t align-middle">
                  <td className="px-4 py-3 font-mono text-sm">{celda.talleCodigo}</td>
                  <td className="px-4 py-3">{celda.colorNombre}</td>
                  <td className="px-4 py-3">
                    <Input
                      value={valor}
                      onChange={(e) => cambiarValor(varianteId, e.target.value)}
                      onBlur={() => guardarCodigo(varianteId)}
                      onKeyDown={(e) => e.key === 'Enter' && guardarCodigo(varianteId)}
                      placeholder="Código del proveedor"
                      className="h-8 text-sm font-mono"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {usandoPropio ? (
                      <Badge variant="secondary" className="text-xs font-mono">{valor}</Badge>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">{codigoAuto}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EtiquetaPreview variante={variante} config={config} escala={1.5} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
