import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from './compra.service';
import { ICompraItem } from './compra.model';

@Component({
  selector: 'jhi-compra',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './compra.component.html',
})
export class CompraComponent implements OnInit {
  items: ICompraItem[] = [];

  private compraService = inject(CompraService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarCompra();
  }

  cargarCompra(): void {
    this.compraService.getCompraItems().subscribe({
      next: items => {
        this.items = items.map(item => ({
          ...item,
          cantidadARestar: 1,
        }));
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('ERROR CARGANDO COMPRA:', error);
      },
    });
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
}
