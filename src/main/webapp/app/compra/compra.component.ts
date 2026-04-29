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
  styleUrl: './compra.component.scss',
})
export class CompraComponent implements OnInit {
  items: ICompraItem[] = [];

  private readonly compraService = inject(CompraService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  mensaje = '';

  ngOnInit(): void {
    this.cargarCompra();
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
      },
    });
  }

  toggleEdicion(item: ICompraItem): void {
    item.mostrarEdicion = !item.mostrarEdicion;
  }

  quitarDeCompra(id: number): void {
    const confirmado = window.confirm('¿Seguro que quieres quitar este producto de la lista de compra?');

    if (!confirmado) {
      return;
    }

    this.compraService.deleteItem(id).subscribe({
      next: () => {
        this.cargarCompra();
      },
      error: error => {
        console.error('ERROR QUITANDO DE COMPRA:', error);
      },
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
          this.mensaje = `${item.producto?.nombre} se ha movido a despensa`;
          this.cargarCompra();
          this.cdr.detectChanges();

          setTimeout(() => {
            this.mensaje = '';
            this.cdr.detectChanges();
          }, 2500);
        },
        error: error => {
          console.error('ERROR MARCANDO COMO COMPRADO:', error);
          item.marcadoComoComprado = false;
          this.cdr.detectChanges();
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
        alert(`Se han restado ${cantidad} ${item.unidadMedida ?? ''} de ${item.producto?.nombre}`);
        this.cargarCompra();
      },
      error: error => {
        console.error('ERROR RESTANDO EN COMPRA:', error);
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
        alert(`Se han añadido ${cantidad} ${item.unidadMedida ?? ''} a ${item.producto?.nombre}`);
        this.cargarCompra();
      },
      error: error => {
        console.error('ERROR SUMANDO EN COMPRA:', error);
      },
    });
  }

  formatearUnidad(unidad?: string): string {
    switch (unidad) {
      case 'UNIDAD':
        return 'Unidad';
      case 'KG':
        return 'Kg';
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

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
