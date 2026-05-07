import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProducto } from './productos.model';
import { ProductosService } from './productos.service';
import { ItemListaService } from './item-lista.service';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit {
  productos: IProducto[] = [];
  nuevoProducto: IProducto = this.crearProductoVacio();
  editando = false;
  filtroCategoria = 'TODAS';

  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  mostrarConfirmacion = false;
  mensajeConfirmacion = '';
  accionConfirmada: (() => void) | null = null;

  private readonly productosService = inject(ProductosService);
  private readonly itemListaService = inject(ItemListaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.cargarProductos();
  }

  crearProductoVacio(): IProducto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      ubicacion: '',
      letraSaludable: '',
      fechaCaducidad: '',
      categoria: 'ALIMENTACION',
    };
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

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: productos => {
        this.productos = productos.map(producto => ({
          ...producto,
          cantidadSeleccionada: producto.cantidadSeleccionada ?? 1,
          unidadSeleccionada: producto.unidadSeleccionada ?? 'UNIDAD',
        }));
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR API PRODUCTOS:', error);
        this.mostrarMensaje(this.translateService.instant('productos.messages.loadedError'), 'error');
      },
    });
  }

  guardarProducto(): void {
    if (this.editando && this.nuevoProducto.id) {
      this.productosService.updateProducto(this.nuevoProducto).subscribe({
        next: () => {
          this.nuevoProducto = this.crearProductoVacio();
          this.editando = false;
          this.cargarProductos();
          this.mostrarMensaje(this.translateService.instant('productos.messages.updated'));
        },
        error: (error: unknown) => {
          console.error('ERROR ACTUALIZANDO PRODUCTO:', error);
          this.mostrarMensaje(this.translateService.instant('productos.messages.updateError'), 'error');
        },
      });
    } else {
      this.productosService.createProducto(this.nuevoProducto).subscribe({
        next: () => {
          this.nuevoProducto = this.crearProductoVacio();
          this.cargarProductos();
          this.mostrarMensaje(this.translateService.instant('productos.messages.created'));
        },
        error: (error: unknown) => {
          console.error('ERROR CREANDO PRODUCTO:', error);
          this.mostrarMensaje(this.translateService.instant('productos.messages.createError'), 'error');
        },
      });
    }
  }

  editarProducto(producto: IProducto): void {
    this.nuevoProducto = { ...producto };
    this.editando = true;

    const formulario = document.getElementById('formulario-producto');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.nuevoProducto = this.crearProductoVacio();
    this.mostrarMensaje(this.translateService.instant('productos.messages.editCancelled'));
  }

  eliminarProducto(id: number): void {
    this.abrirConfirmacion(this.translateService.instant('productos.messages.deleteConfirm'), () => {
      this.productosService.deleteProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
          this.mostrarMensaje(this.translateService.instant('productos.messages.deleted'));
        },
        error: (error: unknown) => {
          console.error('ERROR ELIMINANDO PRODUCTO:', error);
          this.mostrarMensaje(this.translateService.instant('productos.messages.deleteError'), 'error');
        },
      });
    });
  }

  anadirADespensa(producto: IProducto): void {
    this.itemListaService
      .createItemLista({
        cantidad: producto.cantidadSeleccionada ?? 1,
        unidadMedida: producto.unidadSeleccionada ?? 'UNIDAD',
        tipoLista: 'DESPENSA',
        producto: { id: producto.id },
      })
      .subscribe({
        next: () => {
          this.mostrarMensaje(this.translateService.instant('productos.messages.addedToPantry', { name: producto.nombre }));
        },
        error: (error: unknown) => {
          console.error('ERROR AÑADIENDO A DESPENSA:', error);
          this.mostrarMensaje(this.translateService.instant('productos.messages.addToPantryError'), 'error');
        },
      });
  }

  anadirACompra(producto: IProducto): void {
    this.itemListaService
      .createItemLista({
        cantidad: producto.cantidadSeleccionada ?? 1,
        unidadMedida: producto.unidadSeleccionada ?? 'UNIDAD',
        tipoLista: 'COMPRA',
        producto: { id: producto.id },
      })
      .subscribe({
        next: () => {
          this.mostrarMensaje(this.translateService.instant('productos.messages.addedToShopping', { name: producto.nombre }));
        },
        error: (error: unknown) => {
          console.error('ERROR AÑADIENDO A COMPRA:', error);
          this.mostrarMensaje(this.translateService.instant('productos.messages.addToShoppingError'), 'error');
        },
      });
  }

  onCategoriaChange(): void {
    if (this.nuevoProducto.categoria === 'DROGUERIA') {
      this.nuevoProducto.letraSaludable = '';
    }
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  productosFiltrados(): IProducto[] {
    if (this.filtroCategoria === 'TODAS') {
      return this.productos;
    }

    return this.productos.filter(producto => producto.categoria === this.filtroCategoria);
  }
}
