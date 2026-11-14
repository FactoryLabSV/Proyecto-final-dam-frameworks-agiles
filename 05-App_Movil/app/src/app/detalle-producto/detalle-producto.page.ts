import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
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
  IonBadge,
} from '@ionic/angular';

import type { ProductoDetalle } from '../models/producto';
import { Api } from '../services/api';

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
    IonBadge,
  ],
})
export class DetalleProductoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);

  producto: ProductoDetalle | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.api.get<ProductoDetalle>('app/products/' + id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar el detalle:', error.message);
        this.producto = undefined;
        this.cdr.markForCheck();
      },
    });
  }
}
