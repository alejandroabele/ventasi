import {
    ColumnFiltersState,
    PaginationState,
    SortingState,
    Table
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData> {
        customFilter?: (table: Table<TData>) => JSX.Element;
        filterVariant?: string;
        filterOptions?: { label: string; value: string }[];
    }
}

export type PaginationParam = {
    pageIndex: number;
    pageSize: number
}

export type OptionsValue = {
    label: string;
    value: string | number
}

export type Query = {
    pagination: PaginationState;
    columnFilters?: ColumnFiltersState
    sorting?: SortingState
    globalFilter?: string
    columnVisibility?: string[]
    enabled?: boolean
}

// --- Infraestructura: Archivo ---

export type Archivo = {
    id?: number;
    nombre?: string;
    nombreArchivo?: string;
    nombreArchivoOriginal?: string;
    url?: string;
    extension?: string;
    modelo: string;
    modeloId: number;
    tipo?: string;
}

// --- Infraestructura: Usuarios y Roles ---

export type Permiso = {
    id: number;
    nombre: string;
}

export type Usuario = {
    id?: number;
    email: string;
    password?: string | null;
    nombre?: string;
    active?: boolean;
    roleId?: number;
    role?: Role;
    telefono?: string;
    telefonoOtro?: string;
    attemps?: number;
    permisoId?: number;
    permiso?: Permiso;
}

export type User = {
    userId: number;
    nombre: string;
    email: string;
    roleId: number;
    roleName?: string;
    roleColor?: string;
    roleIcon?: string;
}

export interface Permission {
    id: number;
    codigo: string;
    descripcion?: string;
    modulo?: string;
}

export interface Role {
    id: number;
    nombre: string;
    descripcion?: string;
    parentId?: number;
    nivel?: number;
    color?: string;
    icono?: string;
    parent?: Role;
    children?: Role[];
    rolePermissions?: RolePermission[];
}

export interface RolePermission {
    id: number;
    roleId: number;
    permissionId: number;
    role?: Role;
    permission?: Permission;
}

export interface CreatePermissionDto {
    codigo: string;
    descripcion?: string;
    modulo?: string;
}

export interface UpdatePermissionDto {
    codigo?: string;
    descripcion?: string;
    modulo?: string;
}

export interface CreateRolePermissionDto {
    roleId: number;
    permissionId: number;
}

export interface SetRolePermissionsDto {
    roleId: number;
    permissionIds: number[];
}

// --- Infraestructura: Menú ---

export type Menu = ItemMenu[]

export interface ItemMenu {
    title: string
    url: string
    icon?: string
    isActive: boolean
    items: Item[]
}

export interface Item {
    title: string
    url: string
}

export interface Team {
    name: string
    logo: string
    plan: string
}

export interface CheckAccess {
    success: boolean
    hasPermission: boolean
    user: User
    menu: Menu
    permissions: Permission[]
}

// --- Infraestructura: Auditoría ---

export type Auditoria = {
    id: number;
    tabla: string;
    columna: string;
    valorAnterior?: string;
    valorNuevo?: string;
    registroId: number;
    usuarioId: number;
    usuario: Usuario;
    fecha: Date;
}

// --- Infraestructura: Mensajes ---

export type Mensaje = {
    id?: number
    tipoId: number;
    tipo: string;
    fecha?: string;
    mensaje?: string;
    usuarioOrigenId: number;
    usuarioOrigenNombre?: string;
    usuarioDestino?: number;
    usuarioDestinoNombre?: string;
    fecha_visto?: string;
    file?: Archivo;
}

// --- Infraestructura: Notificaciones ---

export type Notificacion = {
    id: number;
    tipoUsuario: number;
    tipoNotificacion?: string;
    usuarioOrigen: number;
    usuarioDestinoId: number;
    fecha?: string;
    nota?: string;
    tipoId?: number;
    tipo?: string;
    fechaVisto?: string
}

export type PlantillaNotificacion = {
    id?: number;
    nombre: string;
    descripcion?: string;
    asunto?: string;
    cuerpo: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EnvioNotificacion = {
    id?: number;
    plantillaNotificacionId?: number;
    plantilla?: PlantillaNotificacion;
    modelo: string;
    modeloId: number;
    canal: 'email' | 'whatsapp';
    estado: 'pendiente' | 'enviado' | 'error';
    asuntoResuelto?: string;
    cuerpoResuelto: string;
    fechaEnvio?: string;
    emailDestinatario?: string;
    error?: string;
    createdAt?: string;
    createdBy?: number;
    createdByUser?: { id: number; nombre: string; email: string };
    updatedAt?: string;
    updatedBy?: number;
}

// --- Infraestructura: Configuración ---

export type Config = {
    id: number;
    clave: string;
    valor: string | null;
    modulo: string | null;
    descripcion: string | null;
    tipo: 'string' | 'number' | 'boolean' | 'json';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// --- Ejemplo ---

export type EjemploCategoria = {
    id?: number;
    nombre: string;
    descripcion?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export type Ejemplo = {
    id?: number;
    nombre: string;
    descripcion?: string;
    fecha?: string;
    estado?: string;
    imagenId?: number;
    imagen?: Archivo;
    ejemploCategoriaId?: number;
    ejemploCategoria?: EjemploCategoria;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

// --- Stock: Clasificación ---
export type Familia = { id?: number; nombre: string; silueta?: string; }
export type Grupo = { id?: number; nombre: string; familiaId: number; familia?: Familia; }
export type Subgrupo = { id?: number; nombre: string; grupoId: number; grupo?: Grupo & { familia?: Familia }; }

// --- Stock: Colores ---
export type ColorCodigo = { id?: number; colorId: number; hex: string; orden: number; }
export type Color = { id?: number; codigo: string; nombre: string; descripcion?: string; codigos?: ColorCodigo[]; codigosHex?: string[]; }
export type CurvaColor = { id?: number; nombre: string; descripcion?: string; colorIds?: number[]; colores?: Color[]; detalles?: CurvaColorDetalle[]; }
export type CurvaColorDetalle = { id?: number; curvaId: number; colorId: number; orden: number; color?: Color; }

// --- Stock: Talles ---
export type Talle = { id?: number; codigo: string; nombre: string; orden: number; }
export type CurvaTalle = { id?: number; nombre: string; descripcion?: string; talleIds?: number[]; talles?: Talle[]; detalles?: CurvaTalleDetalle[]; }
export type CurvaTalleDetalle = { id?: number; curvaId: number; talleId: number; orden: number; talle?: Talle; }

// --- Stock: Artículos ---
export type Articulo = {
    id?: number; nombre: string; descripcion?: string;
    codigo: string; sku: string; codigoBarras?: string; codigoQr?: string;
    precio?: number; subgrupoId: number;
    curvaColorId?: number; curvaId?: number;
    subgrupo?: Subgrupo; curvaColor?: CurvaColor; curva?: CurvaTalle;
    talles?: ArticuloTalle[]; colores?: ArticuloColor[];
    totalVariantes?: number; stockTotal?: string;
}
export type ArticuloTalle = { id?: number; articuloId: number; talleId: number; orden: number; talle?: Talle; }
export type ArticuloColor = { id?: number; articuloId: number; colorId: number; orden: number; color?: Color; }

// --- Stock: Variantes (Grilla) ---
export type ArticuloVariante = { id?: number; articuloId: number; talleId: number; colorId: number; cantidad: string; talle?: Talle; color?: Color; articulo?: { id?: number; nombre: string; sku?: string; }; }
export type CeldaGrilla = {
    talleId: number; talleCodigo: string; talleNombre: string; talleOrden: number;
    colorId: number; colorCodigo: string; colorNombre: string; colorOrden: number; colorCodigos: string[];
    varianteId?: number; cantidad?: string;
    estado: 'potencial' | 'real';
}
export type GrillaColor = { id: number; codigo: string; nombre: string; orden: number; codigos: string[]; }
export type GrillaArticulo = { celdas: CeldaGrilla[]; talles: Talle[]; colores: GrillaColor[]; stockTotal: number; }
export type IngresoItem = { talleId: number; colorId: number; cantidad: string; }

// --- Inventario ---
export type Ubicacion = { id?: number; nombre: string; descripcion?: string; }
export type Proveedor = { id?: number; nombre: string; cuit?: string; telefono?: string; email?: string; }
export type Cliente = { id?: number; nombre: string; email?: string; telefono?: string; }

export type TipoMovimiento = 'MOVIMIENTO' | 'ARREGLO';

export type DetalleMovimiento = {
    articuloVarianteId: number;
    articuloId?: number;
    talleId?: number;
    colorId?: number;
    cantidad: string;
    cantidadNueva?: string;
    cantidadAnterior?: string;
    articuloVariante?: ArticuloVariante;
}

export type UsuarioResumen = { id: number; nombre?: string; email: string; }

export type MovimientoInventario = {
    id?: number;
    tipo: TipoMovimiento;
    fecha: string;
    descripcion?: string;
    cantidadTotal?: string;
    responsableId?: number;
    responsable?: UsuarioResumen;
    procedenciaUbicacionId?: number;
    procedenciaProveedorId?: number;
    procedenciaClienteId?: number;
    destinoUbicacionId?: number;
    destinoProveedorId?: number;
    destinoClienteId?: number;
    procedenciaUbicacion?: Ubicacion;
    procedenciaProveedor?: Proveedor;
    procedenciaCliente?: Cliente;
    destinoUbicacion?: Ubicacion;
    destinoProveedor?: Proveedor;
    destinoCliente?: Cliente;
    detalles?: DetalleMovimiento[];
}

export type StockPorUbicacion = {
    id?: number;
    articuloVarianteId: number;
    ubicacionId: number;
    cantidad: string;
    articuloVariante?: ArticuloVariante;
    ubicacion?: Ubicacion;
}
