export interface SyscomBrand {
    id: string;
    nombre: string;
}

export interface SyscomCategory {
    id: string;
    nombre: string;
}

export interface SyscomProduct {
    id: string;
    nombre: string;
    descripcion_corta: string | null;
    stock: number;
    modelo: string | null;
    marca_id: string | null;
    precios: {
        precio_lista: number;
        precio_descuento: number | null;
    } | null;
    imagen: string | null;
}
