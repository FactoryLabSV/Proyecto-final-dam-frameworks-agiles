import { ChangeDetectorRef, Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular';

import { Api } from '../services/api';

interface Categoria {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel],
})
export class Tab2Page implements OnInit {
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];

  ngOnInit(): void {
    this.cargarCategorias();
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
}
