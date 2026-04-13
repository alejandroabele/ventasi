'use client'

import { cn } from '@/lib/utils'
import { TipoVisitante } from '@/types'

interface TipoConfig {
  valor: TipoVisitante
  etiqueta: string
  emoji: string
}

const TIPOS: TipoConfig[] = [
  { valor: 'MUJER',        etiqueta: 'Mujer',        emoji: '👩' },
  { valor: 'HOMBRE',       etiqueta: 'Hombre',       emoji: '👨' },
  { valor: 'ADULTO_MAYOR', etiqueta: 'Adulto mayor', emoji: '👴' },
  { valor: 'JOVEN',        etiqueta: 'Joven',        emoji: '🧒' },
  { valor: 'PAREJA',       etiqueta: 'Pareja',       emoji: '👫' },
  { valor: 'FAMILIA',      etiqueta: 'Familia',      emoji: '👨‍👩‍👧' },
  { valor: 'GRUPO',        etiqueta: 'Grupo',        emoji: '👥' },
]

interface Props {
  value?: TipoVisitante
  onChange: (tipo: TipoVisitante) => void
}

export function SelectorTipoVisitante({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {TIPOS.map((tipo) => (
        <button
          key={tipo.valor}
          type="button"
          onClick={() => onChange(tipo.valor)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border-3 py-5 px-3',
            'transition-all active:scale-95 touch-manipulation select-none',
            value === tipo.valor
              ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 scale-[1.03]'
              : 'border-2 border-border bg-card hover:border-indigo-300 hover:bg-indigo-50/50'
          )}
        >
          <span className="text-5xl leading-none">{tipo.emoji}</span>
          <span className={cn(
            'text-sm font-semibold text-center leading-tight',
            value === tipo.valor ? 'text-indigo-700' : 'text-foreground'
          )}>
            {tipo.etiqueta}
          </span>
        </button>
      ))}
    </div>
  )
}

export function getTipoLabel(tipo: TipoVisitante): string {
  return TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? tipo
}

export function getTipoEmoji(tipo: TipoVisitante): string {
  return TIPOS.find((t) => t.valor === tipo)?.emoji ?? '👤'
}
