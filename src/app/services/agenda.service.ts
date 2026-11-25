import { Injectable, signal } from '@angular/core';

export interface Actividad {
    id: number;
    titulo: string;
    categoria: string;
    fecha: string;
    fechaISO: string;
    icono: string;
}

export interface HistorialItem {
    id: number;
    titulo: string;
    categoria: string;
    fechaCompletado: string;
    fechaISO: string;
}

const KEY_PENDIENTES = 'agenda_integral_pendientes';
const KEY_HISTORIAL = 'agenda_integral_historial';

@Injectable({
    providedIn: 'root',
})
export class AgendaService {
    readonly actividades = signal<Actividad[]>(this.cargarPendientes());
    readonly historial = signal<HistorialItem[]>(this.cargarHistorial());

  // --- MI AGENDA (PENDIENTES) ---

    agregarActividad(titulo: string, categoria: string, fechaISO: string): void {
        const nueva: Actividad = {
            id: Date.now(),
            titulo: titulo.trim(),
            categoria,
            fechaISO,
            fecha: this.formatearFechaHora(fechaISO),
            icono: this.obtenerIcono(categoria),
        };
        this.actividades.update((lista) => [nueva, ...lista]);
        this.guardarTodo();
    }

    editarActividad(id: number, titulo: string, categoria: string, fechaISO: string): void {
        this.actividades.update((lista) =>
            lista.map((act) =>
            act.id === id
                ? {
                    ...act,
                    titulo: titulo.trim(),
                    categoria,
                    fechaISO,
                    fecha: this.formatearFechaHora(fechaISO),
                    icono: this.obtenerIcono(categoria),
                }
            : act,
            ),
        );
        this.guardarTodo();
    }

    eliminarActividad(id: number): void {
        this.actividades.update((lista) => lista.filter((act) => act.id !== id));
        this.guardarTodo();
    }

    completarActividad(id: number): void {
        const tarea = this.actividades().find((act) => act.id === id);
        if (!tarea) return;

        const hoyISO = new Date().toISOString().split('T')[0];
        const nuevoRegistro: HistorialItem = {
            id: Date.now(),
            titulo: tarea.titulo,
            categoria: tarea.categoria,
            fechaISO: hoyISO,
            fechaCompletado: this.formatearSoloFecha(hoyISO),
        };

        this.actividades.update((lista) => lista.filter((act) => act.id !== id));
        this.historial.update((lista) => [nuevoRegistro, ...lista]);
        this.guardarTodo();
    }

  // --- HISTORIAL (COMPLETADAS) ---

    reprogramarDesdeHistorial(item: HistorialItem, nuevaFechaISO: string): void {
        this.agregarActividad(item.titulo, item.categoria, nuevaFechaISO);
    }

    editarHistorial(id: number, titulo: string, categoria: string, fechaISO: string): void {
        this.historial.update((lista) =>
            lista.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        titulo: titulo.trim(),
                        categoria,
                        fechaISO,
                        fechaCompletado: this.formatearSoloFecha(fechaISO),
                    }
                : item,
                ),
            );
        this.guardarTodo();
    }

    eliminarHistorial(id: number): void {
        this.historial.update((lista) => lista.filter((item) => item.id !== id));
        this.guardarTodo();
    }

  // --- UTILIDADES Y PERSISTENCIA ---

    private guardarTodo(): void {
        localStorage.setItem(KEY_PENDIENTES, JSON.stringify(this.actividades()));
        localStorage.setItem(KEY_HISTORIAL, JSON.stringify(this.historial()));
    }

    private cargarPendientes(): Actividad[] {
        const guardado = localStorage.getItem(KEY_PENDIENTES);
        if (guardado) return JSON.parse(guardado) as Actividad[];

        return [
        {
                id: 1,
                titulo: 'Examen de Programación',
                categoria: 'Estudios',
                fecha: '20 nov, 07:15 pm',
                fechaISO: '2026-11-20T19:15',
                icono: 'book-outline',
            },
            { 
                id: 2,
                titulo: 'Reunión con Ramón',
                categoria: 'Trabajo',
                fecha: '21 nov, 10:30 am',
                fechaISO: '2026-11-21T10:30',
                icono: 'briefcase-outline',
            },
            {
                id: 3,
                titulo: 'Comprar Despensa',
                categoria: 'Compras',
                fecha: '22 nov, 08:30 pm',
                fechaISO: '2026-11-22T20:30',
                icono: 'cart-outline',
            },
            {
                id: 4,
                titulo: 'Pagar Wi-Fi',
                categoria: 'Gastos Hogar',
                fecha: '30 nov, 08:30 pm',
                fechaISO: '2026-11-30T20:30',
                icono: 'wifi-outline',
            },
        ];
    }

    private cargarHistorial(): HistorialItem[] {
        const guardado = localStorage.getItem(KEY_HISTORIAL);
        if (guardado) return JSON.parse(guardado) as HistorialItem[];
        return [
            {
                id: 1,
                titulo: 'Diplomado en Mandos Medios',
                categoria: 'Estudios',
                fechaCompletado: '10 nov, 2026',
                fechaISO: '2026-11-10',
            },
            {
                id: 2,
                titulo: 'Certificación en Manejo de Químicos',
                categoria: 'Trabajo',
                fechaCompletado: '17 oct, 2026',
                fechaISO: '2026-10-17',
            },
            {
                id: 3,
                titulo: 'Examen de conducir',
                categoria: 'Personal',
                fechaCompletado: '01 oct, 2026',
                fechaISO: '2026-10-01',
            },
            {
                id: 4,
                titulo: 'Chequeo dental',
                categoria: 'Salud',
                fechaCompletado: '20 sep, 2026',
                fechaISO: '2026-09-20',
            },
        ];
    }

    private obtenerIcono(categoria: string): string {
        const mapa: Record<string, string> = {
            Estudios: 'book-outline',
            Trabajo: 'briefcase-outline',
            Compras: 'cart-outline',
            'Gastos Hogar': 'wifi-outline',
            Personal: 'person-outline',
            Salud: 'medkit-outline',
            };
        return mapa[categoria] ?? 'calendar-outline';
    }

    private formatearFechaHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    if (Number.isNaN(fecha.getTime())) return fechaISO;
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    }

    private formatearSoloFecha(fechaISO: string): string {
    const fecha = new Date(`${fechaISO}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) return fechaISO;
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    }
}