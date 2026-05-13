import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { FormsModule } from '@angular/forms';
import { DespensaService } from './despensa.service';
import { IDespensaItem } from './despensa.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-despensa',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
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

  menuAccionesAbiertoId: number | null = null;

  private readonly despensaService: DespensaService = inject(DespensaService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly loginService: LoginService = inject(LoginService);
  private readonly router: Router = inject(Router);
  private readonly translateService = inject(TranslateService);

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
          cantidadAPasar: 1,
          mostrarEdicion: false,
        }));
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR CARGANDO DESPENSA:', error);
        this.mostrarMensaje(this.translateService.instant('despensa.messages.loadError'), 'error');
      },
    });
  }

  toggleMenuAcciones(itemId: number): void {
    this.menuAccionesAbiertoId = this.menuAccionesAbiertoId === itemId ? null : itemId;
  }

  cerrarMenuAcciones(): void {
    this.menuAccionesAbiertoId = null;
  }

  toggleEdicion(item: IDespensaItem): void {
    this.cerrarMenuAcciones();
    const abrir = !item.mostrarEdicion;

    this.items.forEach(i => {
      i.mostrarEdicion = false;
    });

    item.mostrarEdicion = abrir;
  }

  quitarDeDespensa(id: number): void {
    this.cerrarMenuAcciones();
    this.abrirConfirmacion(this.translateService.instant('despensa.messages.removeConfirm'), () => {
      this.despensaService.deleteItem(id).subscribe({
        next: () => {
          this.cargarDespensa();
          this.mostrarMensaje(this.translateService.instant('despensa.messages.removed'));
        },
        error: (error: unknown) => {
          console.error('ERROR QUITANDO DE DESPENSA:', error);
          this.mostrarMensaje(this.translateService.instant('despensa.messages.removeError'), 'error');
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
        this.mostrarMensaje(
          this.translateService.instant('despensa.messages.subtracted', {
            amount: cantidad,
            unit: this.formatearUnidad(item.unidadMedida),
            name: item.producto?.nombre,
          }),
        );
      },
      error: (error: unknown) => {
        console.error('ERROR RESTANDO EN DESPENSA:', error);
        this.mostrarMensaje(this.translateService.instant('despensa.messages.quantityError'), 'error');
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
        this.mostrarMensaje(
          this.translateService.instant('despensa.messages.added', {
            amount: cantidad,
            unit: this.formatearUnidad(item.unidadMedida),
            name: item.producto?.nombre,
          }),
        );
      },
      error: (error: unknown) => {
        console.error('ERROR SUMANDO EN DESPENSA:', error);
        this.mostrarMensaje(this.translateService.instant('despensa.messages.quantityError'), 'error');
      },
    });
  }

  formatearUnidad(unidad?: string): string {
    switch (unidad) {
      case 'UNIDAD':
        return this.translateService.instant('despensa.units.unit');
      case 'KG':
        return this.translateService.instant('despensa.units.kg');
      case 'G':
        return this.translateService.instant('despensa.units.g');
      case 'L':
        return this.translateService.instant('despensa.units.l');
      case 'ML':
        return this.translateService.instant('despensa.units.ml');
      default:
        return unidad ?? '';
    }
  }

  pasarACompra(item: IDespensaItem): void {
    this.cerrarMenuAcciones();

    if (!item.id) {
      return;
    }

    const cantidad = item.cantidadAPasar ?? 1;

    if (cantidad <= 0) {
      return;
    }

    item.marcadoParaCompra = true;

    setTimeout(() => {
      this.despensaService.pasarACompra(item.id!, cantidad).subscribe({
        next: () => {
          this.cargarDespensa();
          this.mostrarMensaje(
            this.translateService.instant('despensa.messages.movedToShopping', {
              name: item.producto?.nombre,
            }),
          );
        },
        error: (error: unknown) => {
          console.error('ERROR PASANDO A COMPRA:', error);
          item.marcadoParaCompra = false;
          this.cdr.detectChanges();
          this.mostrarMensaje(this.translateService.instant('despensa.messages.moveToShoppingError'), 'error');
        },
      });
    }, 350);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  pasarTodaLaCantidadACompra(item: IDespensaItem): void {
    this.cerrarMenuAcciones();

    if (!item.id) {
      return;
    }

    const cantidad = item.cantidad ?? 1;

    if (cantidad <= 0) {
      return;
    }

    item.marcadoParaCompra = true;

    setTimeout(() => {
      this.despensaService.pasarACompra(item.id!, cantidad).subscribe({
        next: () => {
          this.cargarDespensa();
          this.mostrarMensaje(
            this.translateService.instant('despensa.messages.movedToShopping', {
              name: item.producto?.nombre,
            }),
          );
        },
        error: (error: unknown) => {
          console.error('ERROR PASANDO TODO A COMPRA:', error);
          item.marcadoParaCompra = false;
          this.cdr.detectChanges();
          this.mostrarMensaje(this.translateService.instant('despensa.messages.moveToShoppingError'), 'error');
        },
      });
    }, 350);
  }

  itemsFiltrados(): IDespensaItem[] {
    if (this.filtroCategoria === 'TODAS') {
      return this.items;
    }

    return this.items.filter(item => item.producto?.categoria === this.filtroCategoria);
  }
}
