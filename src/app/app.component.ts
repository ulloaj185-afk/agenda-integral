import { Component, inject } from '@angular/core';
import {
  IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline, cloudUploadOutline, downloadOutline,
  notificationsOutline, personCircleOutline, pricetagOutline,
  repeatOutline, starOutline, statsChartOutline, trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
    IonList, IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet,
  ],
})
export class AppComponent {
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      calendarOutline, cloudUploadOutline, downloadOutline,
      notificationsOutline, personCircleOutline, pricetagOutline,
      repeatOutline, starOutline, statsChartOutline, trashOutline,
    });
  }

  async abrirOpcion(nombre: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `${nombre}: módulo disponible próximamente.`,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}