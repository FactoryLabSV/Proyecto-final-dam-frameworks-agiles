import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge
} from '@ionic/angular';

import { Api } from '../services/api';
import { ProductoDetalle } from '../models/producto';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge
  ]
})
export class DetalleProductoPage implements OnInit {

  producto: ProductoDetalle | undefined;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDetalle(id);
  }

  cargarDetalle(id: number) {
    this.api.get<ProductoDetalle>('app/products/' + id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar el detalle:', error.message);
        this.producto = undefined;
        this.cdr.markForCheck();
      }
    });
  }
}
