import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, eyeOffOutline, eyeOutline, logInOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

import { AuthError } from '../models/auth';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  imports: [FormsModule, IonContent, IonInput, IonButton, IonIcon, IonSpinner],
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected username = '';
  protected password = '';
  protected mostrarPassword = false;
  protected readonly enviando = signal(false);
  protected readonly intentado = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly puedeReintentar = signal(false);

  protected readonly sessionMessage =
    this.route.snapshot.queryParamMap.get('expired') === '1' ? 'Tu sesión expiró. Iniciá sesión nuevamente.' : '';

  constructor() {
    addIcons({
      alertCircleOutline,
      eyeOffOutline,
      eyeOutline,
      logInOutline,
    });
  }

  protected get usernameError(): string {
    if (!this.intentado()) {
      return '';
    }

    if (this.username.trim() === '') {
      return 'El usuario es obligatorio.';
    }

    if (this.username.trim().length > 50) {
      return 'El usuario no puede superar los 50 caracteres.';
    }

    return '';
  }

  protected get passwordError(): string {
    if (!this.intentado()) {
      return '';
    }

    return this.password === '' ? 'La contraseña es obligatoria.' : '';
  }

  protected alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  protected async iniciarSesion(): Promise<void> {
    if (this.enviando()) {
      return;
    }

    this.intentado.set(true);
    this.errorMessage.set('');
    this.puedeReintentar.set(false);

    if (this.usernameError || this.passwordError) {
      return;
    }

    this.enviando.set(true);

    try {
      await firstValueFrom(this.auth.login(this.username, this.password));

      await this.router.navigateByUrl('/tabs/tab1', {
        replaceUrl: true,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        this.errorMessage.set(error.message);
        this.puedeReintentar.set(error.isOffline);
      } else {
        this.errorMessage.set('Ocurrió un error inesperado. Intentá nuevamente.');
      }
    } finally {
      this.enviando.set(false);
    }
  }
}
