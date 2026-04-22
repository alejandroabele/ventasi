'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Printer, Receipt, Zap, CheckCircle2, Settings2 } from 'lucide-react';
import { PosHeader, PosHeaderState } from '@/components/venta/pos-header';
import { PosArticuloBusqueda } from '@/components/venta/pos-articulo-busqueda';
import { PosCarrito } from '@/components/venta/pos-carrito';
import { PosPago } from '@/components/venta/pos-pago';
import { LoadingButton } from '@/components/ui/loading-button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  useCreateVentaMutation,
  useConfirmarVentaMutation,
  useEmitirManualMutation,
  useEmitirFiscalMutation,
} from '@/hooks/venta';
import { useToast } from '@/hooks/use-toast';
import { Comprobante, Venta, VentaDetalle, VentaFormaPago } from '@/types';
import { cn } from '@/lib/utils';

const LS_FORMATO = 'pos_formato_impresion';
const getFormato = (): 'a4' | 'termica' =>
  (typeof window !== 'undefined' ? localStorage.getItem(LS_FORMATO) : null) as 'a4' | 'termica' ?? 'termica';
const setFormato = (f: 'a4' | 'termica') =>
  typeof window !== 'undefined' && localStorage.setItem(LS_FORMATO, f);

function calcularTotal(detalles: VentaDetalle[]): number {
  const subtotal = detalles.reduce((acc, d) => acc + parseFloat(d.subtotalLinea || '0'), 0);
  return subtotal + subtotal * 0.21;
}

function motivoPendiente(estado: {
  vendedorId?: number;
  clienteId?: number;
  detalles: VentaDetalle[];
  totalPagado: number;
  total: number;
}): string | null {
  if (!estado.vendedorId) return 'Seleccioná un vendedor';
  if (!estado.clienteId) return 'Seleccioná un cliente';
  if (estado.detalles.length === 0) return 'Agregá al menos un artículo';
  if (estado.total > 0 && estado.totalPagado < estado.total - 0.005) return 'Cubrí el saldo restante';
  return null;
}

function estadoInicial() {
  return {
    header: {} as PosHeaderState,
    detalles: [] as VentaDetalle[],
    formasPago: [] as VentaFormaPago[],
  };
}

function nroComprobante(c: Comprobante) {
  return `${c.puntoVenta}-${String(c.numero ?? 0).padStart(8, '0')}`;
}

const TIPO_LABEL: Record<string, string> = {
  A: 'Factura A', B: 'Factura B', C: 'Factura C', X: 'Comp. X',
};

// ── Dialog de impresión ──────────────────────────────────────────
interface PrintDialogProps {
  payload: Venta | null;
  onClose: () => void;
  onVentaCreada: () => void;
}

function PrintDialog({ payload, onClose, onVentaCreada }: PrintDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutateAsync: crear, isPending: isCreando } = useCreateVentaMutation();
  const { mutateAsync: confirmar, isPending: isConfirmando } = useConfirmarVentaMutation();
  const { mutateAsync: emitirManual, isPending: pendingManual } = useEmitirManualMutation();
  const { mutateAsync: emitirFiscal, isPending: pendingFiscal } = useEmitirFiscalMutation();
  const isPending = isCreando || isConfirmando || pendingManual || pendingFiscal;

  const [open, setOpen] = React.useState(false);
  const [ventaId, setVentaId] = React.useState<number | null>(null);
  const [comprobante, setComprobante] = React.useState<Comprobante | null>(null);
  const [formatoActual, setFormatoActual] = React.useState<'a4' | 'termica'>('termica');
  const [mostrarFormato, setMostrarFormato] = React.useState(false);

  React.useEffect(() => {
    if (payload) {
      setOpen(true);
      setVentaId(null);
      setComprobante(null);
      setFormatoActual(getFormato());
    }
  }, [payload]);

  const elegirFormato = (f: 'a4' | 'termica') => {
    setFormatoActual(f);
    setFormato(f);
    setMostrarFormato(false);
  };

  const crearYConfirmar = async (): Promise<number | null> => {
    if (!payload) return null;
    const nueva = await crear(payload);
    if (!nueva.id) return null;
    await confirmar(nueva.id);
    setVentaId(nueva.id);
    onVentaCreada();
    return nueva.id;
  };

  const emitir = async (tipo: 'manual' | 'fiscal') => {
    try {
      const id = await crearYConfirmar();
      if (!id) return;
      const comp = tipo === 'fiscal'
        ? await emitirFiscal({ id, formato: formatoActual })
        : await emitirManual({ id, formato: formatoActual });
      setComprobante(comp);
    } catch {
      toast({ title: 'Error al procesar la venta', variant: 'destructive' });
    }
  };

  const sinComprobante = async () => {
    try {
      const id = await crearYConfirmar();
      if (id) router.push(`/ventas/${id}`);
    } catch {
      toast({ title: 'Error al confirmar la venta', variant: 'destructive' });
    }
  };

  const imprimir = () => {
    window.open(`/print/ventas/${ventaId}?formato=${formatoActual}`, '_blank');
    router.push(`/ventas/${ventaId}`);
  };

  const cerrar = () => {
    if (ventaId) {
      router.push(`/ventas/${ventaId}`);
    } else {
      setOpen(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isPending && cerrar()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
        <VisuallyHidden><DialogTitle>Confirmar venta</DialogTitle></VisuallyHidden>
        {!comprobante ? (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-3 text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold">Confirmar venta</h2>
              {payload?.tipoComprobante && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {TIPO_LABEL[payload.tipoComprobante] ?? payload.tipoComprobante}
                </p>
              )}
            </div>

            {/* Selector de formato (colapsado) */}
            <div className="px-6 pb-3">
              <button
                type="button"
                onClick={() => setMostrarFormato((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Settings2 className="h-3 w-3" />
                  Formato de impresión:
                  <span className="font-semibold text-foreground">
                    {formatoActual === 'termica' ? 'Térmica (arco)' : 'Normal (A4)'}
                  </span>
                </span>
                <span className="text-muted-foreground/50">cambiar</span>
              </button>

              {mostrarFormato && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['termica', 'a4'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => elegirFormato(f)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium transition-all cursor-pointer',
                        formatoActual === f
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:bg-muted',
                      )}
                    >
                      {f === 'termica' ? <Receipt className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
                      {f === 'termica' ? 'Térmica (arco)' : 'Normal (A4)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de emisión */}
            <div className="px-6 pb-6 space-y-2">
              <LoadingButton
                className="w-full h-11 gap-2 font-semibold"
                loading={isPending}
                onClick={() => emitir('fiscal')}
              >
                <Zap className="h-4 w-4" />
                ARCA (fiscal)
              </LoadingButton>

              <LoadingButton
                variant="outline"
                className="w-full h-11 gap-2 font-semibold"
                loading={isPending}
                onClick={() => emitir('manual')}
              >
                {formatoActual === 'termica' ? <Receipt className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
                Sin ARCA (manual)
              </LoadingButton>

              <button
                type="button"
                onClick={sinComprobante}
                disabled={isPending}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
              >
                Sin comprobante
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Comprobante emitido — muestra número */}
            <div className="px-6 pt-6 pb-3 text-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                {formatoActual === 'termica' ? (
                  <Receipt className="h-5 w-5 text-blue-600" />
                ) : (
                  <Printer className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {TIPO_LABEL[comprobante.tipoComprobante] ?? comprobante.tipoComprobante}
                {' · '}
                {comprobante.tipo === 'fiscal' ? 'ARCA' : 'Manual'}
              </p>
              <p className="text-2xl font-bold font-mono tracking-wider mt-1">
                {nroComprobante(comprobante)}
              </p>
              {comprobante.estado === 'pendiente_cae' && (
                <p className="text-xs text-amber-600 mt-1">CAE pendiente de ARCA</p>
              )}
            </div>

            <div className="px-6 pb-6 space-y-2">
              <button
                type="button"
                onClick={imprimir}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {formatoActual === 'termica' ? <Receipt className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
                Imprimir {formatoActual === 'termica' ? 'térmica' : 'A4'}
              </button>
              <button
                type="button"
                onClick={cerrar}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cerrar sin imprimir
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ─────────────────────────────────────────────
export default function NuevaVentaPage() {
  const params = useSearchParams();
  const visitaId = params.get('visitaId') ? parseInt(params.get('visitaId')!) : undefined;

  const [estado, setEstado] = React.useState(estadoInicial);
  const [payloadPendiente, setPayloadPendiente] = React.useState<Venta | null>(null);

  const total = calcularTotal(estado.detalles);
  const totalPagado = estado.formasPago.reduce((acc, fp) => acc + parseFloat(fp.montoConInteres || '0'), 0);

  const motivo = motivoPendiente({
    vendedorId: estado.header.vendedorId,
    clienteId: estado.header.clienteId,
    detalles: estado.detalles,
    totalPagado,
    total,
  });

  const patchHeader = (patch: Partial<PosHeaderState>) =>
    setEstado((p) => ({ ...p, header: { ...p.header, ...patch } }));

  const agregarDetalle = (d: Omit<VentaDetalle, 'id' | 'ventaId'>) =>
    setEstado((p) => ({ ...p, detalles: [...p.detalles, d as VentaDetalle] }));

  const actualizarDetalle = (i: number, patch: Partial<VentaDetalle>) =>
    setEstado((p) => ({
      ...p,
      detalles: p.detalles.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }));

  const eliminarDetalle = (i: number) =>
    setEstado((p) => ({ ...p, detalles: p.detalles.filter((_, idx) => idx !== i) }));

  const agregarPago = (fp: Omit<VentaFormaPago, 'id' | 'ventaId'>) =>
    setEstado((p) => ({ ...p, formasPago: [...p.formasPago, fp as VentaFormaPago] }));

  const eliminarPago = (i: number) =>
    setEstado((p) => ({ ...p, formasPago: p.formasPago.filter((_, idx) => idx !== i) }));

  const handleCobrar = () => {
    const { header, detalles, formasPago } = estado;
    if (!header.clienteId || !header.vendedorId || !header.listaPrecioId) return;

    const subtotal = detalles.reduce((acc, d) => acc + parseFloat(d.subtotalLinea || '0'), 0);
    const iva = subtotal * 0.21;
    const totalFinal = subtotal + iva;

    setPayloadPendiente({
      visitaId: visitaId,
      clienteId: header.clienteId,
      vendedorId: header.vendedorId,
      listaPrecioId: header.listaPrecioId,
      tipoComprobante: header.tipoComprobante ?? 'B',
      fecha: new Date().toISOString().slice(0, 10),
      subtotal: subtotal.toFixed(2),
      baseImponible: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: totalFinal.toFixed(2),
      detalles,
      formasPago,
    });
  };

  const handleVentaCreada = () => {
    setEstado((p) => ({
      ...estadoInicial(),
      header: { listaPrecioId: p.header.listaPrecioId, vendedorId: p.header.vendedorId },
    }));
  };

  return (
    <>
      <PrintDialog
        payload={payloadPendiente}
        onClose={() => setPayloadPendiente(null)}
        onVentaCreada={handleVentaCreada}
      />

      <div className="space-y-4 pb-8">
        <PosHeader state={estado.header} onChange={patchHeader} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Columna izquierda: búsqueda + grilla */}
          <PosArticuloBusqueda
            listaPrecioId={estado.header.listaPrecioId}
            onAgregar={agregarDetalle}
          />

          {/* Columna derecha: carrito + pago + cobrar */}
          <div className="space-y-4 lg:sticky lg:top-4">
            <PosCarrito
              detalles={estado.detalles}
              total={total}
              onUpdate={actualizarDetalle}
              onRemove={eliminarDetalle}
            />

            <PosPago
              formasPago={estado.formasPago}
              totalVenta={total}
              onAdd={agregarPago}
              onRemove={eliminarPago}
            />

            <div className="rounded-xl border bg-card shadow-sm p-4 space-y-2">
              <LoadingButton
                className="w-full h-12 text-base font-bold"
                loading={false}
                disabled={!!motivo}
                onClick={handleCobrar}
              >
                COBRAR ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </LoadingButton>
              {motivo && (
                <p className="text-xs text-muted-foreground text-center">{motivo}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
