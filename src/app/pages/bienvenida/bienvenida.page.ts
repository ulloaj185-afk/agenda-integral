import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonIcon, IonInput, IonItem],
})
export class BienvenidaPage {
  correo = '';
  password = '';
  mostrarPassword = false;
  fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  private router = inject(Router);

  constructor() {
    addIcons({ calendarOutline, eyeOutline, eyeOffOutline });
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(): void {
    this.router.navigate(['/tabs/tab1']);
  }

  continuarSinCuenta(): void {
    this.router.navigate(['/tabs/tab1']);
  }

  recuperarPassword(): void {
    console.log('Recuperar contraseña');
  }
}