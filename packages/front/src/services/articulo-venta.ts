import { Articulo, GrillaArticulo } from '@/types';
import fetchClient from '@/lib/api-client';

export type ArticuloVentaResult = Articulo & { precioVenta?: number };

const buscarArticulos = async (search: string, listaPrecioId?: number): Promise<ArticuloVentaResult[]> => {
    const params = new URLSearchParams({ search, limit: '20', skip: '0' });
    if (listaPrecioId) params.set('listaPrecioId', String(listaPrecioId));
    return fetchClient<ArticuloVentaResult[]>(`articulos?${params.toString()}`, 'GET');
};

const fetchGrillaConPrecio = async (articuloId: number, listaPrecioId?: number): Promise<GrillaArticulo> => {
    const params = listaPrecioId ? `?listaPrecioId=${listaPrecioId}` : '';
    return fetchClient<GrillaArticulo>(`articulos/${articuloId}/grilla${params}`, 'GET');
};

export { buscarArticulos, fetchGrillaConPrecio };
