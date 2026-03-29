import { PERMISOS } from './permisos';

export const MENU = [
    // General
    {
        id: PERMISOS.RUTA_DASHBOARD,
        title: 'Inicio',
        url: '/',
        icon: 'Home',
    },

    // Módulo: Stock
    {
        title: 'Stock',
        icon: 'Package',
        items: [
            {
                id: PERMISOS.RUTA_ARTICULOS,
                title: 'Artículos',
                url: '/articulos',
                icon: 'ShoppingBag',
            },
            {
                id: PERMISOS.RUTA_FAMILIAS,
                title: 'Familias',
                url: '/familias',
                icon: 'FolderOpen',
            },
            {
                id: PERMISOS.RUTA_GRUPOS,
                title: 'Grupos',
                url: '/grupos',
                icon: 'Layers',
            },
            {
                id: PERMISOS.RUTA_SUBGRUPOS,
                title: 'Subgrupos',
                url: '/subgrupos',
                icon: 'Layers2',
            },
            {
                id: PERMISOS.RUTA_COLORES,
                title: 'Colores',
                url: '/colores',
                icon: 'Palette',
            },
            {
                id: PERMISOS.RUTA_CURVAS_COLOR,
                title: 'Curvas de Color',
                url: '/curvas-color',
                icon: 'Palette',
            },
            {
                id: PERMISOS.RUTA_TALLES,
                title: 'Talles',
                url: '/talles',
                icon: 'Ruler',
            },
            {
                id: PERMISOS.RUTA_CURVAS_TALLE,
                title: 'Curvas de Talle',
                url: '/curvas-talle',
                icon: 'LineChart',
            },
        ]
    },

    // Módulo: Ejemplo
    {
        title: 'Ejemplo',
        icon: 'BookOpen',
        items: [
            {
                id: PERMISOS.RUTA_EJEMPLOS,
                title: 'Ejemplos',
                url: '/ejemplos',
                icon: 'List',
            },
            {
                id: PERMISOS.RUTA_EJEMPLO_CATEGORIAS,
                title: 'Categorías de Ejemplo',
                url: '/ejemplo-categorias',
                icon: 'Tag',
            },
        ]
    },

    // Módulo: Administración
    {
        title: 'Administración',
        icon: 'Settings',
        items: [
            {
                id: PERMISOS.RUTA_USUARIOS,
                title: 'Usuarios',
                url: '/usuarios',
                icon: 'Users',
            },
            {
                id: PERMISOS.RUTA_ROLES,
                title: 'Roles',
                url: '/roles',
                icon: 'ShieldCheck',
            },
            {
                id: PERMISOS.RUTA_SMTP_CLIENT,
                title: 'SMTP',
                url: '/administracion/smtp-client',
                icon: 'Mail',
            },
            {
                id: PERMISOS.RUTA_PLANTILLA_NOTIFICACION,
                title: 'Plantillas de Notificación',
                url: '/administracion/plantillas',
                icon: 'FileText',
            },
            {
                id: PERMISOS.RUTA_ENVIO_NOTIFICACION,
                title: 'Envíos de Notificación',
                url: '/administracion/envios-notificacion',
                icon: 'Send',
            },
        ]
    },

    // Configuración
    {
        title: 'Configuración',
        icon: 'SlidersHorizontal',
        items: [
            {
                id: PERMISOS.RUTA_EJEMPLO_CONFIG,
                title: 'Configuración de Ejemplo',
                url: '/config/ejemplo',
                icon: 'Settings2',
            },
        ]
    },
];
