'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Wallet, Banknote, ArrowLeftRight, QrCode, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { MetodoPago } from '@/types';
import { useGetMetodosPagoQuery, useDeleteMetodoPagoMutation } from '@/hooks/metodo-pago';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIPO_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  efectivo: { label: 'Efectivo', icon: Banknote, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  tarjeta_debito: { label: 'Tarjeta débito', icon: CreditCard, bg: 'bg-blue-100', text: 'text-blue-700' },
  tarjeta_credito: { label: 'Tarjeta crédito', icon: CreditCard, bg: 'bg-violet-100', text: 'text-violet-700' },
  transferencia: { label: 'Transferencia', icon: ArrowLeftRight, bg: 'bg-sky-100', text: 'text-sky-700' },
  qr: { label: 'QR / Billetera', icon: QrCode, bg: 'bg-amber-100', text: 'text-amber-700' },
  otro: { label: 'Otro', icon: Wallet, bg: 'bg-gray-100', text: 'text-gray-600' },
};

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function MetodoPagoCard({ metodo, onDelete }: { metodo: MetodoPago; onDelete: (id: number) => void }) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = React.useState(false);
  const cuotasActivas = (metodo.cuotas ?? []).filter((c) => c.activo);
  const tipoCfg = TIPO_CONFIG[metodo.tipo] ?? TIPO_CONFIG['otro'];
  const Icon = tipoCfg.icon;

  return (
    <>
      <DeleteDialog
        onDelete={() => { onDelete(metodo.id!); setOpenDelete(false); }}
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      />
      <div className={cn(
        'group rounded-xl border bg-card p-4 space-y-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer',
        !metodo.activo && 'opacity-60',
      )}
        onClick={() => router.push(`/config/metodos-pago/${metodo.id}`)}
      >
        <div className="flex items-start gap-3">
          <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', tipoCfg.bg)}>
            <Icon className={cn('h-4 w-4', tipoCfg.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{metodo.nombre}</p>
            <p className="text-xs text-muted-foreground">{tipoCfg.label}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              metodo.activo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-500 border-gray-200',
            )}>
              <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', metodo.activo ? 'bg-emerald-500' : 'bg-gray-400')} />
              {metodo.activo ? 'Activo' : 'Inactivo'}
            </span>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/config/metodos-pago/${metodo.id}`); }}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setOpenDelete(true); }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {cuotasActivas.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cuotasActivas.map((c) => (
              <span
                key={c.id}
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                  parseFloat(c.tasaInteres ?? '0') > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {c.cantidadCuotas}×
                {parseFloat(c.tasaInteres ?? '0') > 0 ? ` +${c.tasaInteres}%` : ' s/int.'}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sin cuotas configuradas</p>
        )}
      </div>
    </>
  );
}

export default function MetodosPagoPage() {
  const { data: metodos = [], isLoading } = useGetMetodosPagoQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const { mutate: eliminar } = useDeleteMetodoPagoMutation();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    eliminar(id, {
      onSuccess: () => toast({ description: 'Método de pago eliminado' }),
      onError: () => toast({ description: 'No se puede eliminar este método de pago', variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <PageTitle title="Métodos de pago" />
        <Button asChild size="sm">
          <Link href="/config/metodos-pago/crear">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo método
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : metodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-5 w-5 opacity-40" />
          </div>
          <p className="font-medium">No hay métodos de pago configurados</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/config/metodos-pago/crear">Crear el primero</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metodos.map((m) => (
            <MetodoPagoCard key={m.id} metodo={m} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
