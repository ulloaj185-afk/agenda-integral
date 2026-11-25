import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonInput, IonItem, IonSelect, IonSelectOption, IonTitle, IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { AgendaService } from '../../services/agenda.service';

@Component({
  selector: 'app-nueva-actividad',
  templateUrl: './nueva-actividad.page.html',
  styleUrls: ['./nueva-actividad.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonItem, IonInput, IonSelect, IonSelectOption,
    IonIcon, IonButton,
  ],
})
export class NuevaActividadPage {
  actividad = {
    titulo: '',
    categoria: 'Estudios',
    tipo: 'Evento',
    fechaHora: this.obtenerFechaPorDefecto(),
    recordatorio: '1 día antes',
  };

  private agendaService = inject(AgendaService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ calendarOutline });
  }

  async guardarActividad(): Promise<void> {
    if (!this.actividad.titulo.trim() || !this.actividad.fechaHora) {
      await this.mostrarToast('Por favor completa los campos obligatorios (*).');
      return;
    }

    this.agendaService.agregarActividad(
      this.actividad.titulo,
      this.actividad.categoria,
      this.actividad.fechaHora,
    );

    this.actividad.titulo = '';
    await this.mostrarToast('Actividad guardada en Mi Agenda.');
    await this.router.navigate(['/tabs/tab1']);
  }

  private obtenerFechaPorDefecto(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  }

  private async mostrarToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}