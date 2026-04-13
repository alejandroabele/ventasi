'use client'

import { cn } from '@/lib/utils'
import { CaracteristicaVisitante } from '@/types'
import { useGetCaracteristicasActivasQuery } from '@/hooks/caracteristica-visitante'
import { IconoCaracteristica } from './icono-caracteristica'

interface Props {
  value: number[]
  onChange: (ids: number[]) => void
}

export function SelectorCaracteristicas({ value, onChange }: Props) {
  const { data: caracteristicas = [] } = useGetCaracteristicasActivasQuery()

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  if (!caracteristicas.length) return null

  return (
    <div className="flex flex-wrap gap-3">
      {caracteristicas.map((c: CaracteristicaVisitante) => {
        const seleccionado = value.includes(c.id!)
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id!)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-base font-semibold',
              'transition-all active:scale-95 touch-manipulation select-none',
              seleccionado
                ? 'border-indigo-500 bg-indigo-100 text-indigo-800 shadow-sm'
                : 'border-border bg-card hover:border-indigo-300 text-foreground'
            )}
          >
            <IconoCaracteristica nombre={c.icono} className="h-5 w-5 shrink-0" />
            <span>{c.nombre}</span>
            {seleccionado && (
              <span className="ml-1 text-indigo-500 font-bold text-lg leading-none">✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
