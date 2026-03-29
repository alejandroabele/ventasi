import { GrillaArticulo, IngresoItem } from '@/types';
import fetchClient from '@/lib/api-client';

const basePath = 'articulos';

const fetchGrilla = async (articuloId: number): Promise<GrillaArticulo> => {
    return fetchClient<GrillaArticulo>(`${basePath}/${articuloId}/grilla`, 'GET');
};

const registrarIngreso = async (articuloId: number, items: IngresoItem[]): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/ingresos`, 'POST', { items });
};

const ajustarCantidad = async (articuloId: number, varianteId: number, cantidad: string): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}`, 'PATCH', { cantidad });
};

const remove = async (articuloId: number, varianteId: number): Promise<void> => {
    return fetchClient<void>(`${basePath}/${articuloId}/variantes/${varianteId}`, 'DELETE');
};

export { fetchGrilla, registrarIngreso, ajustarCantidad, remove };
