import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGrilla, registrarIngreso, ajustarCantidad, remove } from '@/services/articulo-variantes';
import { IngresoItem } from '@/types';

export const useGetGrillaQuery = (articuloId: number) => {
    return useQuery({
        queryKey: ['grilla-articulo', articuloId],
        queryFn: () => fetchGrilla(articuloId),
        enabled: !!articuloId,
    });
};

export const useRegistrarIngresoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['registrar-ingreso'],
        mutationFn: ({ articuloId, items }: { articuloId: number; items: IngresoItem[] }) =>
            registrarIngreso(articuloId, items),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['articulo', variables.articuloId] });
        },
    });
};

export const useAjustarCantidadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['ajustar-cantidad'],
        mutationFn: ({ articuloId, varianteId, cantidad }: { articuloId: number; varianteId: number; cantidad: string }) =>
            ajustarCantidad(articuloId, varianteId, cantidad),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
            queryClient.invalidateQueries({ queryKey: ['articulo', variables.articuloId] });
        },
    });
};

export const useDeleteVarianteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-variante'],
        mutationFn: ({ articuloId, varianteId }: { articuloId: number; varianteId: number }) =>
            remove(articuloId, varianteId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grilla-articulo', variables.articuloId] });
        },
    });
};
