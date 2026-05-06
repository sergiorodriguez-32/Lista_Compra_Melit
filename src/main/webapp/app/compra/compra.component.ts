import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { FormsModule } from '@angular/forms';
import { CompraService } from './compra.service';
import { ICompraItem } from './compra.model';

@Component({
  selector: 'jhi-compra',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  private readonly compraService = inject(CompraService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

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
          mostrarEdicion: false,
        }));
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('ERROR CARGANDO COMPRA:', error);
        this.mostrarMensaje('No se ha podido cargar la lista de compra.', 'error');
      },
    });
  }

  toggleEdicion(item: ICompraItem): void {
    item.mostrarEdicion = !item.mostrarEdicion;
  }

  quitarDeCompra(id: number): void {
    this.abrirConfirmacion('¿Quieres quitar este producto de la lista de compra?', () => {
      this.compraService.deleteItem(id).subscribe({
        next: () => {
          this.cargarCompra();
          this.mostrarMensaje('Producto quitado de la compra correctamente.');
        },
        error: error => {
          console.error('ERROR QUITANDO DE COMPRA:', error);
          this.mostrarMensaje('No se ha podido quitar el producto de la compra.', 'error');
        },
      });
    });
  }

  marcarComoComprado(item: ICompraItem): void {
    if (!item.id) {
      return;
    }

    item.marcadoComoComprado = true;

    setTimeout(() => {
      this.compraService.comprarItem(item.id!).subscribe({
        next: () => {
          this.cargarCompra();
          this.mostrarMensaje(`${item.producto?.nombre} se ha movido a la despensa.`);
        },
        error: error => {
          console.error('ERROR MARCANDO COMO COMPRADO:', error);
          item.marcadoComoComprado = false;
          this.cdr.detectChanges();
          this.mostrarMensaje('No se ha podido mover el producto a la despensa.', 'error');
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
        this.mostrarMensaje(`Se han quitado ${cantidad} ${this.formatearUnidad(item.unidadMedida)} de ${item.producto?.nombre}.`);
      },
      error: error => {
        console.error('ERROR RESTANDO EN COMPRA:', error);
        this.mostrarMensaje('No se ha podido actualizar la cantidad en la compra.', 'error');
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
        this.mostrarMensaje(`Se han añadido ${cantidad} ${this.formatearUnidad(item.unidadMedida)} a ${item.producto?.nombre}.`);
      },
      error: error => {
        console.error('ERROR SUMANDO EN COMPRA:', error);
        this.mostrarMensaje('No se ha podido actualizar la cantidad en la compra.', 'error');
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
