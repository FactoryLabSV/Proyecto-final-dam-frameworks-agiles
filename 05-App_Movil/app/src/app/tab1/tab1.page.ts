import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonItem,
  IonAlert
} from '@ionic/angular';

import { Api } from '../services/api';
import { Producto } from '../models/producto';

interface Categoria {
  id: number;
  name: string;
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
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonItem,
    IonAlert
  ]
})
export class Tab1Page implements OnInit {

  resultados: Producto[] = [];
  categorias: Categoria[] = [];

  textoBusqueda = '';
  categoriaSeleccionada: number | null = null;
  busquedaActual = 0;

  cargando = false;
  errorConexion = false;
  mostrarAlerta = false;

  botonesAlerta = [
    {
      text: 'Reintentar',
      handler: () => {
        this.mostrarAlerta = false;
        this.cargarProductos();
      }
    }
  ];

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.api.get<Categoria[]>('app/categories').subscribe({
      next: (respuesta) => {
        this.categorias = respuesta;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error.message);
        this.cdr.markForCheck();
      }
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.errorConexion = false;

    const busqueda = ++this.busquedaActual;

    let params = new HttpParams().set('search', this.textoBusqueda);

    if (this.categoriaSeleccionada !== null) {
      params = params.set('categoryId', this.categoriaSeleccionada);
    }

    this.api.get<{ content: Producto[] }>('app/products', params).subscribe({
      next: (respuesta) => {
        if (busqueda === this.busquedaActual) {
          this.resultados = respuesta.content;
          this.cargando = false;
          this.errorConexion = false;
          this.mostrarAlerta = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        if (busqueda === this.busquedaActual) {
          console.error('Error al cargar productos:', error);

          this.resultados = [];
          this.cargando = false;
          this.errorConexion = true;
          this.mostrarAlerta = true;

          this.cdr.markForCheck();
        }
      }
    });
  }

  buscar(event: CustomEvent) {
    this.textoBusqueda = (event.detail.value || '').trim();
    this.cargarProductos();
  }

  filtrarCategoria(event: CustomEvent) {
    this.categoriaSeleccionada = event.detail.value;
    this.cargarProductos();
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/tabs/tab1/producto', producto.id]);
  }
}
