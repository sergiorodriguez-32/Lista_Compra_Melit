import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompraService } from './compra.service';
import { ICompraItem } from './compra.model';

@Component({
  selector: 'jhi-compra',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        this.items = items;
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
}
