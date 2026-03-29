'use client';

import React from 'react';
import { Articulo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SiluetaSvg, TipoSilueta } from '@/components/stock/siluetas';

interface CombinacionesArticuloProps {
  articulo: Articulo;
}

const ColorSwatch = ({ hex, size = 'md' }: { hex?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const style = hex
    ? { backgroundColor: hex }
    : { background: 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)' };
  return (
    <div
      className={`${dim} rounded-full border shadow-sm flex-shrink-0`}
      style={style}
    />
  );
};

export function CombinacionesArticulo({ articulo }: CombinacionesArticuloProps) {
  const talles = articulo.talles ?? [];
  const colores = articulo.colores ?? [];
  const silueta = articulo.subgrupo?.grupo?.familia?.silueta as TipoSilueta | undefined;

  const getPrimerHex = (color: typeof colores[0]['color']) =>
    color?.codigos?.[0]?.hex;

  const totalCombinaciones = talles.length * colores.length;

  if (talles.length === 0 && colores.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        El artículo no tiene talles ni colores asignados.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary" className="text-sm font-medium">
          {talles.length} talle{talles.length !== 1 ? 's' : ''}
        </Badge>
        <span className="text-muted-foreground">×</span>
        <Badge variant="secondary" className="text-sm font-medium">
          {colores.length} color{colores.length !== 1 ? 'es' : ''}
        </Badge>
        <span className="text-muted-foreground">=</span>
        <Badge className="text-sm font-medium">
          {totalCombinaciones} combinación{totalCombinaciones !== 1 ? 'es' : ''}
        </Badge>
      </div>

      {/* Vista por color con silueta */}
      {silueta && colores.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Vista por color
          </p>
          <div className="flex flex-wrap gap-4">
            {colores.map((ac) => {
              const codigos = ac.color?.codigos ?? [];
              const hexes = codigos.map((c) => c.hex);
              const nombre = ac.color?.nombre ?? '—';
              const codigo = ac.color?.codigo ?? '—';
              return (
                <div key={ac.colorId} className="flex flex-col items-center gap-2 group">
                  <div className="relative rounded-lg bg-muted/40 border border-border/50 p-3 group-hover:bg-muted/70 transition-colors">
                    <SiluetaSvg
                      tipo={silueta}
                      colores={hexes.length > 0 ? hexes : undefined}
                      size={56}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-medium">{codigo}</span>
                    <span className="text-xs text-muted-foreground max-w-16 text-center truncate">{nombre}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Talles */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Talles disponibles
        </p>
        <div className="flex flex-wrap gap-2">
          {talles.map((at) => (
            <div
              key={at.talleId}
              className="border rounded-md px-3 py-1.5 bg-muted/30 text-center min-w-12"
            >
              <span className="font-mono font-semibold text-sm">{at.talle?.codigo ?? at.talleId}</span>
              {at.talle?.nombre && (
                <p className="text-xs text-muted-foreground">{at.talle.nombre}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Colores
        </p>
        <div className="flex flex-wrap gap-2">
          {colores.map((ac) => {
            const codigos = ac.color?.codigos ?? [];
            const hexPrimario = getPrimerHex(ac.color);
            return (
              <div
                key={ac.colorId}
                className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-muted/30"
              >
                {codigos.length > 1 ? (
                  <div className="flex -space-x-1">
                    {codigos.slice(0, 3).map((c, i) => (
                      <ColorSwatch key={i} hex={c?.hex} size="sm" />
                    ))}
                  </div>
                ) : (
                  <ColorSwatch hex={hexPrimario} size="sm" />
                )}
                <div>
                  <span className="font-mono font-medium text-sm">{ac.color?.codigo ?? ac.colorId}</span>
                  {ac.color?.nombre && (
                    <p className="text-xs text-muted-foreground">{ac.color.nombre}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grilla completa talle × color */}
      {talles.length > 0 && colores.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Matriz de combinaciones
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-medium text-left min-w-14 sticky left-0 z-10" />
                  {colores.map((ac) => {
                    const codigos = ac.color?.codigos ?? [];
                    const hexPrimario = getPrimerHex(ac.color);
                    return (
                      <th key={ac.colorId} className="border p-2 bg-muted font-medium text-center min-w-20">
                        <div className="flex flex-col items-center gap-1">
                          {codigos.length > 1 ? (
                            <div className="flex -space-x-1">
                              {codigos.slice(0, 3).map((c, i) => (
                                <ColorSwatch key={i} hex={c?.hex} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <ColorSwatch hex={hexPrimario} size="sm" />
                          )}
                          <span className="text-xs font-mono">{ac.color?.codigo ?? ac.colorId}</span>
                          {ac.color?.nombre && (
                            <span className="text-xs text-muted-foreground">{ac.color.nombre}</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {talles.map((at) => (
                  <tr key={at.talleId}>
                    <td className="border p-2 font-mono font-semibold bg-muted/40 sticky left-0 text-center">
                      {at.talle?.codigo ?? at.talleId}
                    </td>
                    {colores.map((ac) => {
                      const hex = getPrimerHex(ac.color);
                      return (
                        <td key={ac.colorId} className="border p-2 text-center">
                          {hex ? (
                            <div
                              className="w-5 h-5 rounded-sm mx-auto border border-black/10"
                              style={{ backgroundColor: hex }}
                            />
                          ) : (
                            <div
                              className="w-5 h-5 rounded-sm mx-auto border border-black/10"
                              style={{
                                background:
                                  'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 6px)',
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
