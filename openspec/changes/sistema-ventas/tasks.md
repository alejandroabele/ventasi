## 1. Migración SQL y datos iniciales

- [ ] 1.1 Crear migración `5.sql`: tablas `vendedor`, `metodo_pago`, `cuota_metodo_pago`
- [ ] 1.2 Crear migración `5.sql`: tablas `venta`, `venta_detalle`, `venta_forma_pago`, `comprobante`
- [ ] 1.3 Agregar columnas a `cliente`: `cuit`, `condicion_iva`, `domicilio`, `localidad`, `provincia`, `codigo_postal`
- [ ] 1.4 Agregar columna `alicuota_iva` a `articulo` (default `'21'`)
- [ ] 1.5 Agregar columna `venta_id` (nullable FK) a `visita`
- [ ] 1.6 Agregar tipo `VENTA` al enum de `movimiento_inventario.tipo`
- [ ] 1.7 Insertar cliente "Consumidor Final" (CUIT `00000000000`, condicion_iva `CF`)
- [ ] 1.8 Insertar claves de config: `ARCA_PUNTO_VENTA`, `ARCA_RAZON_SOCIAL`, `IMPRESION_FORMATO_DEFAULT`
- [ ] 1.9 Insertar permisos nuevos en tabla `permissions` (vendedor, metodo-pago, venta, comprobante, arca-config)

## 2. Backend — módulo vendedor

- [ ] 2.1 Crear entidad `Vendedor` con campos id, nombre, apellido, dni, codigo, activo
- [ ] 2.2 Crear DTOs `CreateVendedorDto` y `UpdateVendedorDto` con validaciones
- [ ] 2.3 Crear `VendedorService` con CRUD y filtro por nombre/estado
- [ ] 2.4 Crear `VendedorController` con endpoints GET (lista paginada), POST, PUT, DELETE (soft)
- [ ] 2.5 Registrar `VendedorModule` en `AppModule`
- [ ] 2.6 Agregar permisos de vendedor a `permisos.ts` y `routes.ts`

## 3. Backend — módulo metodo-pago y cuotas

- [ ] 3.1 Crear entidades `MetodoPago` y `CuotaMetodoPago`
- [ ] 3.2 Crear DTOs para MetodoPago y CuotaMetodoPago con validaciones
- [ ] 3.3 Crear `MetodoPagoService`: CRUD de métodos + ABM de cuotas por método
- [ ] 3.4 Crear `MetodoPagoController` con endpoints: lista métodos, crear/editar/desactivar método, agregar/editar/desactivar cuota
- [ ] 3.5 Registrar `MetodoPagoModule` en `AppModule`
- [ ] 3.6 Agregar permisos de metodo-pago a `permisos.ts` y `routes.ts`

## 4. Backend — extensión cliente y artículo

- [ ] 4.1 Extender entidad `Cliente` con campos fiscales (CUIT, condicion_iva, domicilio, localidad, provincia, codigo_postal)
- [ ] 4.2 Actualizar DTOs de cliente para incluir campos fiscales opcionales
- [ ] 4.3 Actualizar `ClienteService.remove` para bloquear eliminación si tiene ventas asociadas
- [ ] 4.4 Extender entidad `Articulo` con campo `alicuota_iva`
- [ ] 4.5 Actualizar DTOs de artículo para incluir `alicuota_iva`

## 5. Backend — módulo venta

- [ ] 5.1 Crear entidades `Venta`, `VentaDetalle`, `VentaFormaP ago`
- [ ] 5.2 Crear entidad `Comprobante` con campos tipo, tipo_comprobante, punto_venta, numero, fecha_emision, cae, cae_vencimiento, estado, formato_default, datos_arca
- [ ] 5.3 Crear DTOs: `CreateVentaDto`, `CreateVentaDetalleDto`, `CreateVentaFormaPagoDto`
- [ ] 5.4 Crear `VentaService.crear`: validar visita, cliente, vendedor; guardar en borrador
- [ ] 5.5 Crear `VentaService.confirmar`: cambiar estado a confirmada, generar MovimientoInventario tipo VENTA, actualizar visita.venta_id, todo en transacción
- [ ] 5.6 Crear `VentaService.emitirManual`: asignar número correlativo con SELECT FOR UPDATE, crear comprobante manual
- [ ] 5.7 Crear `VentaService.emitirFiscal`: llamar a afip-api wsfe, manejar éxito (emitido) y error (pendiente_cae)
- [ ] 5.8 Crear `VentaService.reintentar`: reintento de emisión fiscal para comprobantes pendiente_cae
- [ ] 5.9 Crear `VentaService.anular`: cambiar estado de venta y comprobante a anulado
- [ ] 5.10 Crear `VentaController` con endpoints: crear, obtener, confirmar, emitir-manual, emitir-fiscal, reintentar, anular, listado paginado
- [ ] 5.11 Registrar `VentaModule` en `AppModule`
- [ ] 5.12 Agregar permisos de venta y comprobante a `permisos.ts` y `routes.ts`

## 6. Backend afip-api — módulo wsfe

- [ ] 6.1 Crear `WsfeModule` con `WsfeController` y `WsfeService` en `afip-api`
- [ ] 6.2 Implementar `WsfeService.solicitarCae`: autenticar con WSAA (usando LoginService existente), llamar a `FECAESolicitar` via soap, parsear respuesta
- [ ] 6.3 Implementar `WsfeService.obtenerUltimoComprobante`: llamar a `FECompUltimoAutorizado`
- [ ] 6.4 Exponer `@MessagePattern('solicitar-cae')` y `@MessagePattern('obtener-ultimo-comprobante')` en `WsfeController`
- [ ] 6.5 Agregar variable de entorno `AFIP_WSFE_URL` al `.env` de `afip-api`
- [ ] 6.6 Registrar `WsfeModule` en `AppModule` de `afip-api`

## 7. Frontend — configuración vendedores

- [ ] 7.1 Crear servicio `vendedor.ts` con `fetchClient` (getVendedores, createVendedor, updateVendedor, deleteVendedor)
- [ ] 7.2 Crear hook `useVendedores` con React Query (lista, create, update, delete)
- [ ] 7.3 Crear tabla de vendedores con TanStack Table (columnas: código, nombre, apellido, estado, acciones)
- [ ] 7.4 Crear formulario `vendedor-form.tsx` con validación Zod
- [ ] 7.5 Crear página `/config/vendedores` con tabla + modal crear/editar
- [ ] 7.6 Agregar sección "Vendedores" al menú lateral en config

## 8. Frontend — configuración métodos de pago

- [ ] 8.1 Crear servicio `metodo-pago.ts` con fetchClient
- [ ] 8.2 Crear hook `useMetodosPago` con React Query
- [ ] 8.3 Crear formulario `metodo-pago-form.tsx` (ABM de método + tabla inline de cuotas)
- [ ] 8.4 Crear página `/config/metodos-pago` con lista de métodos y edición de cuotas por método
- [ ] 8.5 Agregar sección "Métodos de Pago" al menú lateral en config

## 9. Frontend — extensión formulario cliente

- [ ] 9.1 Agregar campos fiscales al formulario de cliente (CUIT, condición IVA, domicilio, localidad, provincia, CP)
- [ ] 9.2 Implementar auto-completado: al ingresar CUIT válido llamar al endpoint de padrón y pre-completar campos

## 10. Frontend — pantalla de venta

- [ ] 10.1 Crear servicio `venta.ts` con fetchClient (crear, obtener, confirmar, emitir-manual, emitir-fiscal, reintentar, anular)
- [ ] 10.2 Crear hook `useVenta` con React Query (query por id, mutaciones)
- [ ] 10.3 Crear servicio `articulo-variante.ts` para búsqueda de variantes con precio por lista
- [ ] 10.4 Crear componente `VentaCabecera`: selector de cliente (pre-cargado desde visita), vendedor, lista de precio, tipo de comprobante con sugerencia automática
- [ ] 10.5 Crear componente `VentaDetalleTabla`: tabla de líneas con columnas artículo, talle, color, cantidad, precio, descuento (% o $), subtotal, eliminar
- [ ] 10.6 Crear componente `VentaAgregarArticulo`: buscador de artículo + selector de variante + cantidad + confirmar agregar
- [ ] 10.7 Crear componente `VentaTotalizador`: cálculo en tiempo real de subtotal, descuento global (% o $), recargo global (% o $), base imponible, IVA 21%, total
- [ ] 10.8 Crear componente `VentaFormasPago`: selector de método + cuotas con tasa, monto, saldo restante, lista de pagos agregados con eliminación
- [ ] 10.9 Crear componente `VentaAcciones`: botones "Guardar borrador", "Emitir Manual", "Emitir Fiscal ARCA" con lógica de habilitación
- [ ] 10.10 Crear página `/ventas/[id]` ensamblando todos los componentes con layout de dos columnas (detalle | totalizador+pagos)
- [ ] 10.11 Crear página `/ventas` con listado de ventas (tabla paginada con filtros por fecha, estado, cliente)
- [ ] 10.12 Agregar botón "Registrar venta" en la pantalla de resolución de visita (estado COMPRA) que navega a `/ventas/[id]` con visita_id
- [ ] 10.13 Agregar sección "Ventas" al menú lateral

## 11. Frontend — impresión de comprobantes

- [ ] 11.1 Crear componente `ComprobanteA4` con layout A4 y estilos `@media print`
- [ ] 11.2 Crear componente `ComprobanteTermica` con layout 80mm y estilos `@media print`
- [ ] 11.3 Crear página `/ventas/[id]/comprobante` que renderiza el comprobante según formato seleccionado con botón imprimir
- [ ] 11.4 Leer `IMPRESION_FORMATO_DEFAULT` de config y pre-seleccionar el formato en el selector

## 12. Frontend — permisos

- [ ] 12.1 Actualizar `permisos.ts` del frontend con los nuevos permisos de vendedor, metodo-pago, venta y comprobante
- [ ] 12.2 Proteger rutas y botones de acción según permisos RBAC
