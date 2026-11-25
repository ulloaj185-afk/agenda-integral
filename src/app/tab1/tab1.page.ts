import { CommonModule } from '@angular/common';
import type { AfterViewInit, QueryList } from '@angular/core';
import { Component, ElementRef, inject, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ActionSheetController, AlertController, IonButtons, IonCard,
  IonCardContent, IonContent, IonFab, IonFabButton, IonHeader,
  IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding,
  IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add, bookOutline, briefcaseOutline, calendarOutline, cartOutline,
  checkmarkDone, chevronDownCircle, createOutline, medkitOutline,
  personOutline, trash, wifiOutline,
} from 'ionicons/icons';
import type { Actividad } from '../services/agenda.service';
import { AgendaService } from '../services/agenda.service';

type FiltroPeriodo = 'hoy' | 'semana' | 'mes' | '3meses' | '6meses' | '12meses';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonMenuButton, IonIcon, IonContent, IonRefresher,
    IonRefresherContent, IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItemSliding, IonItemOptions, IonItemOption,
    IonItem, IonCard, IonCardContent, IonFab, IonFabButton,
  ],
})
export class Tab1Page implements AfterViewInit {
  @ViewChildren('tarjetaActividad', { read: ElementRef })
  tarjetas!: QueryList<ElementRef<HTMLElement>>;

  fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  filtroActivo: FiltroPeriodo = 'mes';

  private agendaService = inject(AgendaService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      add, bookOutline, briefcaseOutline, calendarOutline, cartOutline,
      checkmarkDone, chevronDownCircle, createOutline, medkitOutline,
      personOutline, trash, wifiOutline,
    });
  }

  get actividades(): Actividad[] {
    const todas = this.agendaService.actividades();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return todas.filter((act) => {
      const fechaAct = new Date(act.fechaISO);
      if (Number.isNaN(fechaAct.getTime())) return true;

      const fechaSoloDia = new Date(fechaAct);
      fechaSoloDia.setHours(0, 0, 0, 0);

      if (this.filtroActivo === 'hoy') {
        return fechaSoloDia.getTime() === hoy.getTime();
      }

      if (this.filtroActivo === 'semana') {
        const diffDias = Math.floor(
          (fechaSoloDia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDias >= 0 && diffDias <= 7;
      }

      if (this.filtroActivo === 'mes') {
        return (
          fechaAct.getMonth() === hoy.getMonth() &&
          fechaAct.getFullYear() === hoy.getFullYear()
        );
      }

      const mesesPorFiltro: Record<'3meses' | '6meses' | '12meses', number> = {
        '3meses': 3,
        '6meses': 6,
        '12meses': 12,
      };

      const limite = new Date(hoy);
      limite.setMonth(limite.getMonth() + mesesPorFiltro[this.filtroActivo]);

      return (
        fechaSoloDia.getTime() >= hoy.getTime() &&
        fechaSoloDia.getTime() <= limite.getTime()
      );
    });
  }

  cambiarFiltro(event: CustomEvent): void {
    const valor = event.detail.value as FiltroPeriodo | undefined;
    if (valor) {
      this.filtroActivo = valor;
    }
  }

  ngAfterViewInit(): void {
    this.configurarLongPress();
    this.tarjetas.changes.subscribe(() => {
      this.configurarLongPress();
    });
  }

  refrescar(event: CustomEvent): void {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement | null;
      void refresher?.complete();
    }, 1000);
  }

  completar(id: number): void {
    this.agendaService.completarActividad(id);
    void this.mostrarToast('Actividad completada y movida al Historial.');
  }

  eliminar(id: number): void {
    const actividad = this.actividades.find((a) => a.id === id);
    if (!actividad) return;
    void this.confirmarEliminacion(actividad);
  }

  calcularTiempoRestante(fechaISO: string): string {
    const ahora = new Date();
    const objetivo = new Date(fechaISO);
    const diffMs = objetivo.getTime() - ahora.getTime();
    const diffHoras = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMs < 0) {
      if (diffDias === 0) return diffHoras <= 1 ? 'Venció hace 1 h' : `Venció hace ${diffHoras} h`;
      return diffDias === 1 ? 'Vencida hace 1 día' : `Vencida hace ${diffDias} días`;
    }

    if (diffDias === 0) {
      return diffHoras <= 1 ? 'En menos de 1 h' : `Faltan ${diffHoras} h`;
    }

    if (diffDias < 30) {
      return diffDias === 1 ? 'Falta 1 día' : `Faltan ${diffDias} días`;
    }

    const meses = Math.floor(diffDias / 30);
    const diasRestantes = diffDias % 30;
    const textoMes = meses === 1 ? '1 mes' : `${meses} meses`;

    if (diasRestantes === 0) return `Faltan ${textoMes}`;
    const textoDias = diasRestantes === 1 ? '1 día' : `${diasRestantes} días`;
    return `Faltan ${textoMes} y ${textoDias}`;
  }

  estaVencida(fechaISO: string): boolean {
    return new Date(fechaISO).getTime() < Date.now();
  }

  private configurarLongPress(): void {
    this.tarjetas.forEach((tarjeta) => {
      const elemento = tarjeta.nativeElement;
      if (elemento.dataset['lpBound']) return;
      elemento.dataset['lpBound'] = 'true';

      let temporizador: ReturnType<typeof setTimeout> | null = null;
      let inicioX = 0;
      let inicioY = 0;

      const cancelar = (): void => {
        if (temporizador) {
          clearTimeout(temporizador);
          temporizador = null;
        }
      };

      elemento.addEventListener('pointerdown', (ev: PointerEvent) => {
        inicioX = ev.clientX;
        inicioY = ev.clientY;
        temporizador = setTimeout(() => {
          const indice = this.tarjetas.toArray().findIndex((t) => t.nativeElement === elemento);
          const actividad = this.actividades[indice];
          if (actividad) {
            void this.abrirMenuRapido(actividad);
          }
        }, 550);
      });

      elemento.addEventListener('pointermove', (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - inicioX) > 10 || Math.abs(ev.clientY - inicioY) > 10) {
          cancelar();
        }
      });

      elemento.addEventListener('pointerup', cancelar);
      elemento.addEventListener('pointercancel', cancelar);
    });
  }

  private async abrirMenuRapido(actividad: Actividad): Promise<void> {
    const hoja = await this.actionSheetCtrl.create({
      header: actividad.titulo,
      buttons: [
        {
          text: 'Completar actividad',
          icon: 'checkmark-done',
          handler: () => {
            this.completar(actividad.id);
          },
        },
        {
          text: 'Editar actividad',
          icon: 'create-outline',
          handler: () => {
            void this.editarActividad(actividad);
          },
        },
        {
          text: 'Eliminar actividad',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            void this.confirmarEliminacion(actividad);
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

  private async editarActividad(actividad: Actividad): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Editar actividad',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          value: actividad.titulo,
          placeholder: 'Título de la actividad',
        },
        {
          name: 'categoria',
          type: 'text',
          value: actividad.categoria,
          placeholder: 'Categoría (Estudios, Trabajo, Compras...)',
        },
        {
          name: 'fechaISO',
          type: 'datetime-local',
          value: actividad.fechaISO.slice(0, 16),
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data: { titulo?: string; categoria?: string; fechaISO?: string }) => {
            if (!data.titulo?.trim() || !data.fechaISO) return false;
            this.agendaService.editarActividad(
              actividad.id,
              data.titulo,
              data.categoria?.trim() || actividad.categoria,
              data.fechaISO,
            );
            void this.mostrarToast('Actividad actualizada.');
            return true;
          },
        },
      ],
    });
    await alerta.present();
  }

  private async confirmarEliminacion(actividad: Actividad): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar actividad',
      message: `¿Seguro que deseas eliminar "${actividad.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.agendaService.eliminarActividad(actividad.id);
            void this.mostrarToast('Actividad eliminada.');
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
}