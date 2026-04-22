import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProducto } from './productos.model';
import { ProductosService } from './productos.service';

@Component({
  selector: 'jhi-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  productos: IProducto[] = [];

  nuevoProducto: IProducto = this.crearProductoVacio();
  editando = false;

  private productosService = inject(ProductosService);
  private cdr = inject(ChangeDetectorRef);

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
    };
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: productos => {
        this.productos = productos;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('ERROR API PRODUCTOS:', error);
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
        },
        error: error => {
          console.error('ERROR ACTUALIZANDO PRODUCTO:', error);
        },
      });
    } else {
      this.productosService.createProducto(this.nuevoProducto).subscribe({
        next: () => {
          this.nuevoProducto = this.crearProductoVacio();
          this.cargarProductos();
        },
        error: error => {
          console.error('ERROR CREANDO PRODUCTO:', error);
        },
      });
    }
  }

  editarProducto(producto: IProducto): void {
    this.nuevoProducto = { ...producto };
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.nuevoProducto = this.crearProductoVacio();
    this.editando = false;
  }

  eliminarProducto(id: number): void {
    const confirmado = window.confirm('¿Seguro que quieres eliminar este producto?');

    if (!confirmado) {
      return;
    }

    this.productosService.deleteProducto(id).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: error => {
        console.error('ERROR ELIMINANDO PRODUCTO:', error);
      },
    });
  }
}
