import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DespensaService } from './despensa.service';
import { IDespensaItem } from './despensa.model';

@Component({
  selector: 'jhi-despensa',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './despensa.component.html',
})
export class DespensaComponent implements OnInit {
  items: IDespensaItem[] = [];

  private despensaService = inject(DespensaService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarDespensa();
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
      error: error => {
        console.error('ERROR CARGANDO DESPENSA:', error);
      },
    });
  }

  toggleEdicion(item: IDespensaItem): void {
    item.mostrarEdicion = !item.mostrarEdicion;
  }

  quitarDeDespensa(id: number): void {
    const confirmado = window.confirm('¿Seguro que quieres quitar este producto de la despensa?');

    if (!confirmado) {
      return;
    }

    this.despensaService.deleteItem(id).subscribe({
      next: () => {
        this.cargarDespensa();
      },
      error: error => {
        console.error('ERROR QUITANDO DE DESPENSA:', error);
      },
    });
  }

  restarCantidad(item: IDespensaItem): void {
    const cantidad = item.cantidadARestar ?? 1;

    if (!item.id || cantidad <= 0) {
      return;
    }

    this.despensaService.restarCantidad(item.id, cantidad).subscribe({
      next: () => {
        alert(`Se han restado ${cantidad} ${item.unidadMedida ?? ''} de ${item.producto?.nombre}`);
        this.cargarDespensa();
      },
      error: error => {
        console.error('ERROR RESTANDO EN DESPENSA:', error);
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
        alert(`Se han añadido ${cantidad} ${item.unidadMedida ?? ''} a ${item.producto?.nombre}`);
        this.cargarDespensa();
      },
      error: error => {
        console.error('ERROR SUMANDO EN DESPENSA:', error);
      },
    });
  }
}
