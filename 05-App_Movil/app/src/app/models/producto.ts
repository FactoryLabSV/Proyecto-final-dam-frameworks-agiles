export interface PresentacionResumen {
  presentationName: string;
  stock: number;
  stockStatus: string;
}

export interface Producto {
  id: number;
  code: string;
  name: string;
  categoryName: string;
  stock: PresentacionResumen[];
}

export interface PresentacionDetalle {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  price: number | null;
  stock: number;
  stockStatus: string;
}

export interface ProductoDetalle {
  id: number;
  code: string;
  name: string;
  description: string;
  categoryName: string;
  productTypeName: string;
  brandName: string | null;
  presentations: PresentacionDetalle[];
}

export const PRODUCTOS_SIMULADOS: Producto[] = [
  {
    id: 1,
    code: 'PROD001',
    name: 'Abono granulado',
    categoryName: 'Fertilizantes',
    stock: [
      { presentationName: 'Bolsa 1 kg', stock: 15, stockStatus: 'OK' },
      { presentationName: 'Saco 25 kg', stock: 4, stockStatus: 'LOW' },
    ],
  },
  {
    id: 2,
    code: 'PROD002',
    name: 'Cemento gris',
    categoryName: 'Construcción',
    stock: [{ presentationName: 'Bolsa 42.5 kg', stock: 30, stockStatus: 'OK' }],
  },
  {
    id: 3,
    code: 'PROD003',
    name: 'Clavos de acero',
    categoryName: 'Ferretería',
    stock: [
      { presentationName: 'Libra', stock: 20, stockStatus: 'OK' },
      { presentationName: 'Caja', stock: 0, stockStatus: 'OUT' },
    ],
  },
];

export const DETALLES_SIMULADOS: ProductoDetalle[] = [
  {
    id: 1,
    code: 'PROD001',
    name: 'Abono granulado',
    description: 'Abono para cultivos',
    categoryName: 'Fertilizantes',
    productTypeName: 'Consumible',
    brandName: null,
    presentations: [
      {
        code: 'AB001',
        name: 'Bolsa 1 kg',
        unit: 'Kilogramo',
        quantity: 1,
        price: 3.5,
        stock: 15,
        stockStatus: 'OK',
      },
      {
        code: 'AB002',
        name: 'Saco 25 kg',
        unit: 'Kilogramo',
        quantity: 25,
        price: 28.0,
        stock: 4,
        stockStatus: 'LOW',
      },
    ],
  },
  {
    id: 2,
    code: 'PROD002',
    name: 'Cemento gris',
    description: 'Cemento para construcción',
    categoryName: 'Construcción',
    productTypeName: 'Consumible',
    brandName: null,
    presentations: [
      {
        code: 'CE001',
        name: 'Bolsa 42.5 kg',
        unit: 'Kilogramo',
        quantity: 42.5,
        price: 9.5,
        stock: 30,
        stockStatus: 'OK',
      },
    ],
  },
  {
    id: 3,
    code: 'PROD003',
    name: 'Clavos de acero',
    description: 'Clavos para construcción',
    categoryName: 'Ferretería',
    productTypeName: 'Consumible',
    brandName: null,
    presentations: [
      {
        code: 'CL001',
        name: 'Libra',
        unit: 'Libra',
        quantity: 1,
        price: 1.75,
        stock: 20,
        stockStatus: 'OK',
      },
      {
        code: 'CL002',
        name: 'Caja',
        unit: 'Unidad',
        quantity: 1,
        price: null,
        stock: 0,
        stockStatus: 'OUT',
      },
    ],
  },
];
