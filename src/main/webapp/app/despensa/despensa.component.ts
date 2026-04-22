import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DespensaService } from './despensa.service';
import { IDespensaItem } from './despensa.model';

@Component({
  selector: 'jhi-despensa',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        this.items = items;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('ERROR CARGANDO DESPENSA:', error);
      },
    });
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
}
