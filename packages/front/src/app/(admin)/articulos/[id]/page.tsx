'use client';

import ArticuloForm from '@/components/forms/articulo-form';
import { CombinacionesArticulo } from '@/components/stock/combinaciones-articulo';
import { PageTitle } from '@/components/ui/page-title';
import { useGetArticuloByIdQuery } from '@/hooks/articulos';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Package, Layers, PencilLine } from 'lucide-react';
import React from 'react';
import { SkeletonTable } from '@/components/skeletons/skeleton-table';

function InformacionArticulo({ data }: { data: NonNullable<ReturnType<typeof useGetArticuloByIdQuery>['data']> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{data.nombre}</h2>
          {data.descripcion && (
            <p className="mt-1 text-muted-foreground leading-relaxed">{data.descripcion}</p>
          )}
        </div>
      </div>

      <Separator />

      {data.subgrupo && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Clasificación</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.subgrupo.grupo?.familia && (
              <>
                <Badge variant="outline" className="font-normal">
                  {data.subgrupo.grupo.familia.nombre}
                </Badge>
                <span className="text-muted-foreground">›</span>
              </>
            )}
            {data.subgrupo.grupo && (
              <>
                <Badge variant="outline" className="font-normal">
                  {data.subgrupo.grupo.nombre}
                </Badge>
                <span className="text-muted-foreground">›</span>
              </>
            )}
            <Badge variant="secondary" className="font-medium">
              {data.subgrupo.nombre}
            </Badge>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Identificadores</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.codigo && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="font-mono font-semibold mt-0.5">{data.codigo}</p>
            </div>
          )}
          {data.sku && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">SKU</p>
              <p className="font-mono font-semibold mt-0.5">{data.sku}</p>
            </div>
          )}
          {data.codigoBarras && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Cód. barras</p>
              <p className="font-mono font-semibold mt-0.5">{data.codigoBarras}</p>
            </div>
          )}
          {data.codigoQr && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Cód. QR</p>
              <p className="font-mono font-semibold mt-0.5">{data.codigoQr}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.curva && (
          <div className="border rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Curva de talles</p>
            <p className="font-medium">{data.curva.nombre}</p>
            {data.talles && data.talles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.talles.map((at) => (
                  <span key={at.talleId} className="bg-muted font-mono text-xs px-2 py-0.5 rounded">
                    {at.talle?.codigo ?? at.talleId}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {data.curvaColor && (
          <div className="border rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Curva de colores</p>
            <p className="font-medium">{data.curvaColor.nombre}</p>
            {data.colores && data.colores.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.colores.map((ac) => (
                  <div key={ac.colorId} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                    <span className="font-medium">{ac.color?.nombre ?? ac.colorId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetArticuloByIdQuery(Number(id));

  if (isLoading) return <SkeletonTable />;

  return (
    <>
      <PageTitle title={data?.nombre || 'Artículo'} />

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info" className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Información
          </TabsTrigger>
          <TabsTrigger value="variantes" className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Variantes
          </TabsTrigger>
          <TabsTrigger value="editar" className="flex items-center gap-1.5">
            <PencilLine className="h-3.5 w-3.5" />
            Editar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              {data ? (
                <InformacionArticulo data={data} />
              ) : (
                <p className="text-muted-foreground">No se encontró el artículo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variantes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Combinaciones posibles</CardTitle>
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

        <TabsContent value="editar">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editar artículo</CardTitle>
            </CardHeader>
            <CardContent>
              <ArticuloForm defaultValues={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
