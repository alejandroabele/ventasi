'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetArticulosQuery } from '@/hooks/articulos';
import { Printer, Search } from 'lucide-react';
import { Articulo } from '@/types';

const PAGINACION = { pagination: { pageIndex: 0, pageSize: 200 } };

export default function EtiquetasNuevaPage() {
  const router = useRouter();
  const [busqueda, setBusqueda] = React.useState('');
  const [seleccionados, setSeleccionados] = React.useState<Set<number>>(new Set());

  const { data: articulos = [], isLoading } = useGetArticulosQuery(PAGINACION as any);

  const articulosFiltrados = React.useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const q = busqueda.toLowerCase();
    return articulos.filter(
      (a: Articulo) =>
        a.nombre?.toLowerCase().includes(q) ||
        a.codigo?.toLowerCase().includes(q) ||
        a.sku?.toLowerCase().includes(q),
    );
  }, [articulos, busqueda]);

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === articulosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(articulosFiltrados.map((a: Articulo) => a.id!)));
    }
  };

  const prepararEtiquetas = () => {
    const ids = Array.from(seleccionados).join(',');
    router.push(`/etiquetas/preparar?articuloIds=${ids}`);
  };

  const todosSeleccionados =
    articulosFiltrados.length > 0 && seleccionados.size === articulosFiltrados.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Imprimir etiquetas" />
        <Button
          disabled={seleccionados.size === 0}
          onClick={prepararEtiquetas}
        >
          <Printer className="h-4 w-4 mr-2" />
          Preparar etiquetas ({seleccionados.size})
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar artículos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Cargando artículos...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox
                    checked={todosSeleccionados}
                    onCheckedChange={toggleTodos}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Artículo</th>
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
              </tr>
            </thead>
            <tbody>
              {articulosFiltrados.map((articulo: Articulo) => (
                <tr
                  key={articulo.id}
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  onClick={() => toggleSeleccion(articulo.id!)}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={seleccionados.has(articulo.id!)}
                      onCheckedChange={() => toggleSeleccion(articulo.id!)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{articulo.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{articulo.codigo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{articulo.sku}</td>
                </tr>
              ))}
              {articulosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron artículos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
