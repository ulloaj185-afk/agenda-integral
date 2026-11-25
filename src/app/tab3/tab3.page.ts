import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonButtons, IonContent, IonHeader,
  IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenuButton,
  IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline, calendarOutline, globeOutline, helpCircleOutline,
  informationCircleOutline, logOutOutline, moonOutline, notificationsOutline,
  personOutline, shieldCheckmarkOutline, shieldOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule, IonButton, IonButtons, IonContent, IonHeader,
    IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenuButton,
    IonTitle, IonToolbar,
  ],
})
export class Tab3Page {
  notificacionesActivas = true;

  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  constructor() {
    addIcons({
      arrowForwardOutline, calendarOutline, globeOutline, helpCircleOutline,
      informationCircleOutline, logOutOutline, moonOutline, notificationsOutline,
      personOutline, shieldCheckmarkOutline, shieldOutline,
    });
  }

  alternarNotificaciones(): void {
    this.notificacionesActivas = !this.notificacionesActivas;
  }

  abrirOpcion(nombre: string): void {
    console.log('Opción seleccionada:', nombre);
  }

  async mostrarInfo(titulo: string, mensaje: string): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['Entendido'],
    });
    await alerta.present();
  }

  async cerrarSesion(): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir a la pantalla de bienvenida?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            void this.router.navigateByUrl('/bienvenida', { replaceUrl: true });
          },
        },
      ],
    });
    await alerta.present();
  }
}