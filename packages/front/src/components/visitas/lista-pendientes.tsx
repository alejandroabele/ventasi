'use client'

import { useGetVisitasPendientesQuery } from '@/hooks/visita'
import { Visita } from '@/types'
import { getTipoEmoji, getTipoLabel } from './selector-tipo-visitante'
import { Clock } from 'lucide-react'
import { IconoCaracteristica } from './icono-caracteristica'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  onNoCompra: (visitaId: number) => void
}

export function ListaPendientes({ onNoCompra }: Props) {
  const { data: pendientes = [] } = useGetVisitasPendientesQuery()
  const router = useRouter()

  if (!pendientes.length) {
    return (
      <div className="rounded-2xl border border-dashed py-14 flex flex-col items-center gap-3 text-muted-foreground">
        <Clock className="h-10 w-10 opacity-25" />
        <p className="text-base font-medium">Sin visitas pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pendientes.map((visita: Visita) => (
        <div key={visita.id} className="rounded-2xl border bg-card overflow-hidden">

          {/* Info visitante */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-14 h-14 rounded-2xl border bg-muted/40 flex items-center justify-center shrink-0">
              <span className="text-4xl">{getTipoEmoji(visita.tipoVisitante)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">{getTipoLabel(visita.tipoVisitante)}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-sm text-muted-foreground">{visita.hora}</span>
                {visita.caracteristicas?.map((c) => (
                  <span key={c.id} className="text-sm text-muted-foreground">
                    · <IconoCaracteristica nombre={c.icono} className="h-3 w-3 inline" /> {c.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 border-t">
            <button
              onClick={() => router.push(`/movimientos/crear?visitaId=${visita.id}`)}
              className={cn(
                'flex items-center justify-center py-5',
                'bg-green-600 hover:bg-green-700 active:bg-green-800',
                'active:scale-[0.98] transition-all touch-manipulation select-none',
                'border-r border-green-500'
              )}
            >
              <span className="text-white font-bold text-xl">Compró</span>
            </button>
            <button
              onClick={() => onNoCompra(visita.id!)}
              className={cn(
                'flex items-center justify-center py-5',
                'bg-red-600 hover:bg-red-700 active:bg-red-800',
                'active:scale-[0.98] transition-all touch-manipulation select-none'
              )}
            >
              <span className="text-white font-bold text-xl">No compró</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
