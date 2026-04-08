'use client';

import ArticuloForm from '@/components/forms/articulo-form';
import { CombinacionesArticulo } from '@/components/stock/combinaciones-articulo';
import { PageTitle } from '@/components/ui/page-title';
import { useGetArticuloByIdQuery } from '@/hooks/articulos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Warehouse, PencilLine } from 'lucide-react';
import React from 'react';
import { SkeletonTable } from '@/components/skeletons/skeleton-table';
import { useRouter, useSearchParams } from 'next/navigation';

const TABS = ['info', 'inventario'] as const;
type Tab = typeof TABS[number];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetArticuloByIdQuery(Number(id));
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab') as Tab | null;
  const tabActual: Tab = tabParam && TABS.includes(tabParam) ? tabParam : 'info';

  const cambiarTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <SkeletonTable />;

  return (
    <>
      <PageTitle title={data?.nombre || 'Artículo'} />

      <Tabs value={tabActual} onValueChange={cambiarTab} className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1 flex items-center gap-1.5">
            <PencilLine className="h-3.5 w-3.5" />
            Información
          </TabsTrigger>
          <TabsTrigger value="inventario" className="flex-1 flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5" />
            Inventario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editar artículo</CardTitle>
            </CardHeader>
            <CardContent>
              <ArticuloForm defaultValues={data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock por variante</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <CombinacionesArticulo articulo={data} />
              ) : (
                <p className="text-muted-foreground">No se encontró el artículo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
