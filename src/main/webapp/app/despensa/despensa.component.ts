import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { FormsModule } from '@angular/forms';
import { DespensaService } from './despensa.service';
import { IDespensaItem } from './despensa.model';

@Component({
  selector: 'jhi-despensa',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './despensa.component.html',
  styleUrls: ['./despensa.component.scss'],
})
export class DespensaComponent implements OnInit {
  items: IDespensaItem[] = [];
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  filtroCategoria = 'TODAS';

  mostrarConfirmacion = false;
  mensajeConfirmacion = '';
  accionConfirmada: (() => void) | null = null;

  private readonly despensaService: DespensaService = inject(DespensaService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly loginService: LoginService = inject(LoginService);
  private readonly router: Router = inject(Router);

  ngOnInit(): void {
    this.cargarDespensa();
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' = 'success'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensaje = '';
      this.cdr.detectChanges();
    }, 2500);
  }

  abrirConfirmacion(mensaje: string, accion: () => void): void {
    this.mensajeConfirmacion = mensaje;
    this.accionConfirmada = accion;
    this.mostrarConfirmacion = true;
    this.cdr.detectChanges();
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.mensajeConfirmacion = '';
    this.accionConfirmada = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    if (this.accionConfirmada) {
      this.accionConfirmada();
    }
    this.cancelarConfirmacion();
  }

  cargarDespensa(): void {
    this.despensaService.getDespensaItems().subscribe({
      next: items => {
        this.items = items.map(item => ({
          ...item,
          cantidadARestar: 1,
          cantidadASumar: 1,
          mostrarEdicion: false,
        }));
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR CARGANDO DESPENSA:', error);
        this.mostrarMensaje('No se ha podido cargar la despensa.', 'error');
      },
    });
  }

  toggleEdicion(item: IDespensaItem): void {
    item.mostrarEdicion = !item.mostrarEdicion;
  }

  quitarDeDespensa(id: number): void {
    this.abrirConfirmacion('¿Quieres quitar este producto de la despensa?', () => {
      this.despensaService.deleteItem(id).subscribe({
        next: () => {
          this.cargarDespensa();
          this.mostrarMensaje('Producto quitado de la despensa correctamente.');
        },
        error: (error: unknown) => {
          console.error('ERROR QUITANDO DE DESPENSA:', error);
          this.mostrarMensaje('No se ha podido quitar el producto de la despensa.', 'error');
        },
      });
    });
  }

  restarCantidad(item: IDespensaItem): void {
    const cantidad = item.cantidadARestar ?? 1;

    if (!item.id || cantidad <= 0) {
      return;
    }

    this.despensaService.restarCantidad(item.id, cantidad).subscribe({
      next: () => {
        this.cargarDespensa();
        this.mostrarMensaje(`Se han quitado ${cantidad} ${this.formatearUnidad(item.unidadMedida)} de ${item.producto?.nombre}.`);
      },
      error: (error: unknown) => {
        console.error('ERROR RESTANDO EN DESPENSA:', error);
        this.mostrarMensaje('No se ha podido actualizar la cantidad en despensa.', 'error');
      },
    });
  }

  sumarCantidad(item: IDespensaItem): void {
    const cantidad = item.cantidadASumar ?? 1;

    if (!item.id || cantidad <= 0) {
      return;
    }

    this.despensaService.sumarCantidad(item.id, cantidad).subscribe({
      next: () => {
        this.cargarDespensa();
        this.mostrarMensaje(`Se han añadido ${cantidad} ${this.formatearUnidad(item.unidadMedida)} a ${item.producto?.nombre}.`);
      },
      error: (error: unknown) => {
        console.error('ERROR SUMANDO EN DESPENSA:', error);
        this.mostrarMensaje('No se ha podido actualizar la cantidad en despensa.', 'error');
      },
    });
  }

  formatearUnidad(unidad?: string): string {
    switch (unidad) {
      case 'UNIDAD':
        return 'unidad';
      case 'KG':
        return 'kg';
      case 'G':
        return 'g';
      case 'L':
        return 'L';
      case 'ML':
        return 'ml';
      default:
        return unidad ?? '';
    }
  }

  pasarACompra(item: IDespensaItem): void {
    if (!item.id) {
      return;
    }

    item.marcadoParaCompra = true;

    setTimeout(() => {
      this.despensaService.pasarACompra(item.id!).subscribe({
        next: () => {
          this.cargarDespensa();
          this.mostrarMensaje(`${item.producto?.nombre} se ha movido a la compra.`);
        },
        error: (error: unknown) => {
          console.error('ERROR PASANDO A COMPRA:', error);
          item.marcadoParaCompra = false;
          this.cdr.detectChanges();
          this.mostrarMensaje('No se ha podido mover el producto a la compra.', 'error');
        },
      });
    }, 350);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  itemsFiltrados(): IDespensaItem[] {
    if (this.filtroCategoria === 'TODAS') {
      return this.items;
    }

    return this.items.filter(item => item.producto?.categoria === this.filtroCategoria);
  }
}
