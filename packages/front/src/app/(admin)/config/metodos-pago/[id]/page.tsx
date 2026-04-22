'use client'

import MetodoPagoForm from "@/components/forms/metodo-pago-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetMetodoPagoByIdQuery } from '@/hooks/metodo-pago'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const { data, isLoading, isFetching } = useGetMetodoPagoByIdQuery(parseInt(id))
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Método de Pago" />
            <MetodoPagoForm data={data} />
        </>
    )
}
