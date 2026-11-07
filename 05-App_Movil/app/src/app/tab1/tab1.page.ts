
import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular';

interface Presentacion {
  codigo: string;
  nombre: string;
  existencia: number;
}

interface Producto {
  codigo: string;
  nombre: string;
  presentaciones: Presentacion[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ],
})
export class Tab1Page {

  productos: Producto[] = [
    {
      codigo: 'PROD001',
      nombre: 'Abono granulado',
      presentaciones: [
        { codigo: 'AB001', nombre: 'Bolsa 1 kg', existencia: 15 },
        { codigo: 'AB002', nombre: 'Saco 25 kg', existencia: 4 }
      ]
    },
    {
      codigo: 'PROD002',
      nombre: 'Cemento gris',
      presentaciones: [
        { codigo: 'CE001', nombre: 'Bolsa 42.5 kg', existencia: 30 }
      ]
    },
    {
      codigo: 'PROD003',
      nombre: 'Clavos de acero',
      presentaciones: [
        { codigo: 'CL001', nombre: 'Libra', existencia: 20 },
        { codigo: 'CL002', nombre: 'Caja', existencia: 8 }
      ]
    }
  ];

  resultados: Producto[] = [];

  constructor() {
    this.resultados = this.productos;
  }

  buscar(event: any) {
    const texto = (event.detail.value || '').trim().toLowerCase();

    if (texto === '') {
      this.resultados = this.productos;
      return;
    }

    this.resultados = this.productos.filter(producto => {
      const nombre = producto.nombre.toLowerCase();
      const codigo = producto.codigo.toLowerCase();

      const coincidePresentacion = producto.presentaciones.some(
        presentacion => presentacion.codigo.toLowerCase() === texto
      );

      return nombre.includes(texto) ||
             codigo === texto ||
             coincidePresentacion;
    });
  }
}
