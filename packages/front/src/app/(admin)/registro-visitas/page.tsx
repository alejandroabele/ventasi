'use client'

import React from 'react'
import { DialogNuevaVisita } from '@/components/visitas/dialog-nueva-visita'
import { ListaPendientes } from '@/components/visitas/lista-pendientes'
import { ModalNoCompra } from '@/components/visitas/modal-no-compra'
import { useGetMetricasDiaQuery } from '@/hooks/visita'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegistroVisitasPage() {
  const [dialogAbierto, setDialogAbierto] = React.useState(false)
  const [visitaNoCompraId, setVisitaNoCompraId] = React.useState<number | null>(null)
  const { data: m } = useGetMetricasDiaQuery()

  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* Fecha */}
      <p className="text-sm text-muted-foreground capitalize">{hoy}</p>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Entradas"   value={m?.entradas   ?? 0} />
        <StatCard label="Compras"    value={m?.compras    ?? 0} />
        <StatCard label="No compras" value={m?.noCompras  ?? 0} />
        <StatCard label="Conversión" value={`${m?.conversion ?? 0}%`} />
        <StatCard
          label="Pendientes"
          value={m?.pendientes ?? 0}
          highlight={!!m?.pendientes}
        />
      </div>

      {/* Botón principal */}
      <button
        onClick={() => setDialogAbierto(true)}
        className={cn(
          'w-full rounded-2xl bg-primary text-primary-foreground',
          'flex items-center justify-center gap-4 py-10',
          'active:scale-[0.99] transition-transform touch-manipulation select-none',
        )}
      >
        <UserPlus className="h-8 w-8 shrink-0" strokeWidth={2} />
        <span className="text-3xl font-bold">Entró alguien</span>
      </button>

      {/* Pendientes */}
      <div className="space-y-3">
        {!!m?.pendientes && (
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Por resolver</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {m.pendientes}
            </span>
          </div>
        )}
        <ListaPendientes onNoCompra={setVisitaNoCompraId} />
      </div>

      <DialogNuevaVisita open={dialogAbierto} onOpenChange={setDialogAbierto} />
      <ModalNoCompra visitaId={visitaNoCompraId} onClose={() => setVisitaNoCompraId(null)} />
    </div>
  )
}

function StatCard({ label, value, highlight = false }: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className={cn(
      'rounded-2xl border py-5 text-center',
      highlight ? 'border-amber-300 bg-amber-50' : 'bg-card'
    )}>
      <p className={cn('text-4xl font-black leading-none', highlight && 'text-amber-700')}>{value}</p>
      <p className={cn('text-sm font-medium mt-1.5', highlight ? 'text-amber-600' : 'text-muted-foreground')}>{label}</p>
    </div>
  )
}
