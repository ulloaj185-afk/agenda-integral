import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ActionSheetController, AlertController, IonButtons, IonCard, IonCardContent,
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonMenuButton,
  IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add, calendarOutline, checkboxOutline, createOutline, refreshOutline, trashOutline,
} from 'ionicons/icons';
import type { HistorialItem } from '../services/agenda.service';
import { AgendaService } from '../services/agenda.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent,
    IonSearchbar, IonSelect, IonSelectOption,
    IonList, IonCard, IonCardContent, IonIcon,
    IonFab, IonFabButton,
  ],
})
export class Tab2Page {
  textoBusqueda = '';
  filtroFecha = 'recientes';
  filtroCategoria = 'todas';
  escalaZoom = 1;
  fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  private agendaService = inject(AgendaService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  private distanciaInicial = 0;
  private escalaInicial = 1;

  constructor() {
    addIcons({
      add, calendarOutline, checkboxOutline, createOutline, refreshOutline, trashOutline,
    });
  }

  get historialFiltrado(): HistorialItem[] {
    return this.agendaService.historial().filter((item) => {
      const coincideTexto = item.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideCategoria = this.filtroCategoria === 'todas' || item.categoria === this.filtroCategoria;
      return coincideTexto && coincideCategoria;
    });
  }

  async abrirOpcionesHistorial(item: HistorialItem): Promise<void> {
    const hoja = await this.actionSheetCtrl.create({
      header: item.titulo,
      buttons: [
        {
          text: 'Reprogramar / Reutilizar en Mi Agenda',
          icon: 'refresh-outline',
          handler: () => {
            void this.reprogramarItem(item);
          },
        },
        {
          text: 'Editar registro',
          icon: 'create-outline',
          handler: () => {
            void this.editarItem(item);
          },
        },
        {
          text: 'Eliminar del historial',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            void this.confirmarEliminacion(item);
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await hoja.present();
  }

  private async reprogramarItem(item: HistorialItem): Promise<void> {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaSugerida = `${manana.toISOString().split('T')[0]}T09:00`;

    const alerta = await this.alertCtrl.create({
      header: 'Reprogramar actividad',
      subHeader: item.titulo,
      inputs: [
        {
          name: 'fechaISO',
          type: 'datetime-local',
          value: fechaSugerida,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agendar',
          handler: (data: { fechaISO?: string }) => {
            if (!data.fechaISO) return false;
            this.agendaService.reprogramarDesdeHistorial(item, data.fechaISO);
            void this.mostrarToast('Actividad reprogramada en Mi Agenda.');
            return true;
          },
        },
      ],
    });
    await alerta.present();
  }

  private async editarItem(item: HistorialItem): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Editar registro',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          value: item.titulo,
          placeholder: 'Título de la actividad',
        },
        {
          name: 'categoria',
          type: 'text',
          value: item.categoria,
          placeholder: 'Categoría (Estudios, Trabajo, Salud...)',
        },
        {
          name: 'fechaISO',
          type: 'date',
          value: item.fechaISO,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data: { titulo?: string; categoria?: string; fechaISO?: string }) => {
            if (!data.titulo?.trim() || !data.fechaISO) return false;
            this.agendaService.editarHistorial(
              item.id,
              data.titulo,
              data.categoria?.trim() || item.categoria,
              data.fechaISO,
            );
            void this.mostrarToast('Registro actualizado.');
            return true;
          },
        },
      ],
    });
    await alerta.present();
  }

  private async confirmarEliminacion(item: HistorialItem): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar del historial',
      message: `¿Seguro que deseas eliminar "${item.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.agendaService.eliminarHistorial(item.id);
            void this.mostrarToast('Registro eliminado.');
          },
        },
      ],
    });
    await alerta.present();
  }

  private async mostrarToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  calcularTiempoAtras(fechaISO: string): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(`${fechaISO}T00:00:00`);
    const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias <= 0) return 'Hoy';
    if (diffDias === 1) return 'Hace 1 día';
    if (diffDias < 30) return `Hace ${diffDias} días`;

    const meses = Math.floor(diffDias / 30);
    const diasRestantes = diffDias % 30;
    const textoMes = meses === 1 ? '1 mes' : `${meses} meses`;

    if (diasRestantes === 0) return `Hace ${textoMes}`;
    const textoDias = diasRestantes === 1 ? '1 día' : `${diasRestantes} días`;
    return `Hace ${textoMes} y ${textoDias}`;
  }

  cambiarZoom(delta: number): void {
    this.escalaZoom = Math.min(Math.max(Number((this.escalaZoom + delta).toFixed(2)), 0.8), 1.6);
  }

  reiniciarZoom(): void {
    this.escalaZoom = 1;
  }

  alIniciarToque(ev: TouchEvent): void {
    if (ev.touches.length === 2) {
      this.distanciaInicial = this.calcularDistancia(ev.touches[0], ev.touches[1]);
      this.escalaInicial = this.escalaZoom;
    }
  }

  alMoverToque(ev: TouchEvent): void {
    if (ev.touches.length === 2 && this.distanciaInicial > 0) {
      ev.preventDefault();
      const distanciaActual = this.calcularDistancia(ev.touches[0], ev.touches[1]);
      const nuevaEscala = this.escalaInicial * (distanciaActual / this.distanciaInicial);
      this.escalaZoom = Math.min(Math.max(nuevaEscala, 0.8), 1.6);
    }
  }

  alUsarRueda(ev: WheelEvent): void {
    if (ev.ctrlKey) {
      ev.preventDefault();
      this.cambiarZoom(ev.deltaY < 0 ? 0.1 : -0.1);
    }
  }

  private calcularDistancia(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }
}