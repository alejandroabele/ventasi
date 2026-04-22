'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VentaCabecera } from '@/components/venta/venta-cabecera';
import { VentaDetalleTabla } from '@/components/venta/venta-detalle-tabla';
import { VentaAgregarArticulo } from '@/components/venta/venta-agregar-articulo';
import { VentaTotalizador, calcularTotales } from '@/components/venta/venta-totalizador';
import { VentaFormasPago } from '@/components/venta/venta-formas-pago';
import { LoadingButton } from '@/components/ui/loading-button';
import { useCreateVentaMutation } from '@/hooks/venta';
import { useToast } from '@/hooks/use-toast';
import { Venta, VentaDetalle, VentaFormaPago } from '@/types';

export default function NuevaVentaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const visitaId = params.get('visitaId') ? parseInt(params.get('visitaId')!) : undefined;
  const clienteId = params.get('clienteId') ? parseInt(params.get('clienteId')!) : undefined;
  const { toast } = useToast();

  const [venta, setVenta] = React.useState<Partial<Venta>>({
    visitaId: visitaId!,
    clienteId: clienteId,
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [detalles, setDetalles] = React.useState<VentaDetalle[]>([]);
  const [formasPago, setFormasPago] = React.useState<VentaFormaPago[]>([]);
  const [openAgregar, setOpenAgregar] = React.useState(false);

  const { mutateAsync: crear, isPending } = useCreateVentaMutation();

  const patchVenta = (patch: Partial<Venta>) => setVenta((p) => ({ ...p, ...patch }));

  const totales = calcularTotales(
    detalles,
    venta.descuentoPorcentaje ?? '',
    venta.descuentoMonto ?? '',
    venta.recargoPorcentaje ?? '',
    venta.recargoMonto ?? '',
  );

  const canSubmit =
    !!venta.clienteId &&
    !!venta.vendedorId &&
    !!venta.listaPrecioId &&
    !!venta.tipoComprobante &&
    detalles.length > 0;

  const handleCrear = async () => {
    try {
      const payload: Venta = {
        ...venta,
        detalles,
        formasPago,
        subtotal: totales.subtotal.toFixed(2),
        baseImponible: totales.baseImponible.toFixed(2),
        iva: totales.iva.toFixed(2),
        total: totales.total.toFixed(2),
      } as Venta;

      const nueva = await crear(payload);
      toast({ title: 'Venta creada' });
      router.push(`/ventas/${nueva.id}`);
    } catch {
      toast({ title: 'Error al crear la venta', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/ventas')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Ventas
          </button>
          <span className="text-muted-foreground/50 text-sm">/</span>
          <span className="text-sm font-semibold">Nueva venta</span>
        </div>
      </div>

      {/* Cabecera */}
      <VentaCabecera venta={venta} onChange={patchVenta} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Columna principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                Artículos
                {detalles.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({detalles.length})
                  </span>
                )}
              </span>
            </div>
            <Button onClick={() => setOpenAgregar(true)} size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Agregar artículo
            </Button>
          </div>

          <VentaDetalleTabla
            detalles={detalles}
            onUpdate={(i, patch) => setDetalles((prev) => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d))}
            onRemove={(i) => setDetalles((prev) => prev.filter((_, idx) => idx !== i))}
          />

          <VentaTotalizador detalles={detalles} venta={venta} onChange={patchVenta} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <VentaFormasPago
            formasPago={formasPago}
            totalVenta={totales.total}
            onAdd={(fp) => setFormasPago((prev) => [...prev, fp as VentaFormaPago])}
            onRemove={(i) => setFormasPago((prev) => prev.filter((_, idx) => idx !== i))}
          />

          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
            <LoadingButton
              className="w-full h-9"
              loading={isPending}
              disabled={!canSubmit}
              onClick={handleCrear}
            >
              Guardar como borrador
            </LoadingButton>

            {!canSubmit && (
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Completá cliente, vendedor, lista de precios, tipo de comprobante y al menos un artículo
              </p>
            )}
          </div>
        </div>
      </div>

      <VentaAgregarArticulo
        open={openAgregar}
        onClose={() => setOpenAgregar(false)}
        listaPrecioId={venta.listaPrecioId}
        onAgregar={(d) => setDetalles((prev) => [...prev, d as VentaDetalle])}
      />
    </div>
  );
}
