import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { FormsModule } from '@angular/forms';
import { CompraService } from './compra.service';
import { ICompraItem } from './compra.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-compra',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.scss'],
})
export class CompraComponent implements OnInit {
  items: ICompraItem[] = [];
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  filtroCategoria = 'TODAS';

  mostrarConfirmacion = false;
  mensajeConfirmacion = '';
  accionConfirmada: (() => void) | null = null;

  menuAccionesAbiertoId: number | null = null;

  private readonly compraService = inject(CompraService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.cargarCompra();
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

  cargarCompra(): void {
    this.compraService.getCompraItems().subscribe({
      next: items => {
        this.items = items.map(item => ({
          ...item,
          cantidadARestar: 1,
          cantidadASumar: 1,
          cantidadAPasar: 1,
          mostrarEdicion: false,
        }));
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR CARGANDO COMPRA:', error);
        this.mostrarMensaje(this.translateService.instant('compra.messages.loadError'), 'error');
      },
    });
  }

  toggleMenuAcciones(itemId: number): void {
    this.menuAccionesAbiertoId = this.menuAccionesAbiertoId === itemId ? null : itemId;
  }

  cerrarMenuAcciones(): void {
    this.menuAccionesAbiertoId = null;
  }

  toggleEdicion(item: ICompraItem): void {
    this.cerrarMenuAcciones();
    const abrir = !item.mostrarEdicion;

    this.items.forEach(i => {
      i.mostrarEdicion = false;
    });

    item.mostrarEdicion = abrir;
  }

  quitarDeCompra(id: number): void {
    this.cerrarMenuAcciones();
    this.abrirConfirmacion(this.translateService.instant('compra.messages.removeConfirm'), () => {
      this.compraService.deleteItem(id).subscribe({
        next: () => {
          this.cargarCompra();
          this.mostrarMensaje(this.translateService.instant('compra.messages.removed'));
        },
        error: (error: unknown) => {
          console.error('ERROR QUITANDO DE COMPRA:', error);
          this.mostrarMensaje(this.translateService.instant('compra.messages.removeError'), 'error');
        },
      });
    });
  }

  marcarComoComprado(item: ICompraItem): void {
    this.cerrarMenuAcciones();

    if (!item.id) {
      return;
    }

    const cantidad = item.cantidad ?? 1;

    item.marcadoComoComprado = true;

    setTimeout(() => {
      this.compraService.comprarItem(item.id!, cantidad).subscribe({
        next: () => {
          this.cargarCompra();
          this.mostrarMensaje(
            this.translateService.instant('compra.messages.movedToPantry', {
              name: item.producto?.nombre,
            }),
          );
        },
        error: (error: unknown) => {
          console.error('ERROR MARCANDO COMO COMPRADO:', error);
          item.marcadoComoComprado = false;
          this.cdr.detectChanges();
          this.mostrarMensaje(this.translateService.instant('compra.messages.moveToPantryError'), 'error');
        },
      });
    }, 350);
  }

  pasarCantidadADespensa(item: ICompraItem): void {
    this.cerrarMenuAcciones();

    if (!item.id) {
      return;
    }

    const cantidad = item.cantidadAPasar ?? 1;

    if (cantidad <= 0) {
      return;
    }

    item.marcadoComoComprado = true;

    setTimeout(() => {
      this.compraService.comprarItem(item.id!, cantidad).subscribe({
        next: () => {
          this.cargarCompra();
          this.mostrarMensaje(
            this.translateService.instant('compra.messages.movedToPantry', {
              name: item.producto?.nombre,
            }),
          );
        },
        error: (error: unknown) => {
          console.error('ERROR PASANDO CANTIDAD A DESPENSA:', error);
          item.marcadoComoComprado = false;
          this.cdr.detectChanges();
          this.mostrarMensaje(this.translateService.instant('compra.messages.moveToPantryError'), 'error');
        },
      });
    }, 350);
  }

  restarCantidad(item: ICompraItem): void {
    const cantidad = item.cantidadARestar ?? 1;

    if (!item.id || cantidad <= 0) {
      return;
    }

    this.compraService.restarCantidad(item.id, cantidad).subscribe({
      next: () => {
        this.cargarCompra();
        this.mostrarMensaje(
          this.translateService.instant('compra.messages.subtracted', {
            amount: cantidad,
            unit: this.formatearUnidad(item.unidadMedida),
            name: item.producto?.nombre,
          }),
        );
      },
      error: (error: unknown) => {
        console.error('ERROR RESTANDO EN COMPRA:', error);
        this.mostrarMensaje(this.translateService.instant('compra.messages.quantityError'), 'error');
      },
    });
  }

  sumarCantidad(item: ICompraItem): void {
    const cantidad = item.cantidadASumar ?? 1;

    if (!item.id || cantidad <= 0) {
      return;
    }

    this.compraService.sumarCantidad(item.id, cantidad).subscribe({
      next: () => {
        this.cargarCompra();
        this.mostrarMensaje(
          this.translateService.instant('compra.messages.added', {
            amount: cantidad,
            unit: this.formatearUnidad(item.unidadMedida),
            name: item.producto?.nombre,
          }),
        );
      },
      error: (error: unknown) => {
        console.error('ERROR SUMANDO EN COMPRA:', error);
        this.mostrarMensaje(this.translateService.instant('compra.messages.quantityError'), 'error');
      },
    });
  }

  formatearUnidad(unidad?: string): string {
    switch (unidad) {
      case 'UNIDAD':
        return this.translateService.instant('compra.units.unit');
      case 'KG':
        return this.translateService.instant('compra.units.kg');
      case 'G':
        return this.translateService.instant('compra.units.g');
      case 'L':
        return this.translateService.instant('compra.units.l');
      case 'ML':
        return this.translateService.instant('compra.units.ml');
      default:
        return unidad ?? '';
    }
  }

  itemsFiltrados(): ICompraItem[] {
    if (this.filtroCategoria === 'TODAS') {
      return this.items;
    }

    return this.items.filter(item => item.producto?.categoria === this.filtroCategoria);
  }

  calcularTotalCompra(): number {
    return this.itemsFiltrados().reduce((total, item) => {
      const precio = item.producto?.precio ?? 0;
      const cantidad = item.cantidad ?? 0;
      return total + precio * cantidad;
    }, 0);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
