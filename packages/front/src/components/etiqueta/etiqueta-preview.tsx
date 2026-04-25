'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { EtiquetaConfig, generarCodigoBarras } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

type Props = {
  variante: VarianteEtiqueta;
  config: EtiquetaConfig;
  escala?: number;
};

const MM_TO_PX = 3.7795;

export function EtiquetaPreview({ variante, config, escala = 3 }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const codigo = generarCodigoBarras(variante);

  const ancho = config.ancho_mm * MM_TO_PX * escala;
  const alto = config.alto_mm * MM_TO_PX * escala;

  useEffect(() => {
    if (barcodeRef.current && config.campos.includes('codigoBarras')) {
      try {
        JsBarcode(barcodeRef.current, codigo, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 10 * escala,
          height: 30 * escala,
          margin: 0,
          background: 'transparent',
        });
      } catch {
        // código inválido, no renderizar
      }
    }
  }, [codigo, config.campos, escala]);

  return (
    <div
      style={{
        width: `${ancho}px`,
        height: `${alto}px`,
        border: '1px solid #d1d5db',
        borderRadius: 4,
        backgroundColor: '#ffffff',
        padding: `${4 * escala}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${2 * escala}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
      }}
    >
      {config.campos.includes('titulo') && (
        <div
          style={{
            fontSize: `${7 * escala}px`,
            fontWeight: 700,
            lineHeight: 1.1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {variante.articuloNombre}
        </div>
      )}

      {(config.campos.includes('talle') || config.campos.includes('color')) && (
        <div style={{ fontSize: `${6 * escala}px`, display: 'flex', gap: `${4 * escala}px` }}>
          {config.campos.includes('talle') && (
            <span>
              <strong>T:</strong> {variante.talleNombre}
            </span>
          )}
          {config.campos.includes('color') && (
            <span>
              <strong>C:</strong> {variante.colorNombre}
            </span>
          )}
        </div>
      )}

      {config.campos.includes('codigoBarras') && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
          <svg ref={barcodeRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
      )}
    </div>
  );
}
