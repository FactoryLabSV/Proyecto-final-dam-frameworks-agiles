import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonAlert,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

import type { Producto } from '../models/producto';
import { Api } from '../services/api';
import { Auth } from '../services/auth';

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
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonAlert,
  ],
})
export class Tab1Page implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

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
      handler: (): void => {
        this.mostrarAlerta = false;
        this.cargarProductos();
      },
    },
  ];

  constructor() {
    addIcons({ logOutOutline });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.api.get<Categoria[]>('app/categories').subscribe({
      next: (respuesta) => {
        this.categorias = respuesta;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error.message);
        this.cdr.markForCheck();
      },
    });
  }

  cargarProductos(): void {
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
      },
    });
  }

  buscar(event: CustomEvent): void {
    const valor = event.detail.value;
    const texto = typeof valor === 'string' ? valor : '';

    // La API recibe un único parámetro de búsqueda: nombre, código
    // de producto o código exacto de presentación.
    this.textoBusqueda = texto.trim().slice(0, 100);
    this.cargarProductos();
  }

  filtrarCategoria(event: CustomEvent): void {
    const valor = event.detail.value;

    this.categoriaSeleccionada = typeof valor === 'number' ? valor : null;
    this.cargarProductos();
  }

  verDetalle(producto: Producto): void {
    this.router.navigate(['/tabs/tab1/producto', producto.id]);
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
