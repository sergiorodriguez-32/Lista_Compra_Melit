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

  nuevoProducto: IProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    ubicacion: '',
    letraSaludable: '',
    fechaCaducidad: '',
  };

  private productosService = inject(ProductosService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarProductos();
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

  crearProducto(): void {
    this.productosService.createProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.nuevoProducto = {
          nombre: '',
          descripcion: '',
          precio: 0,
          ubicacion: '',
          letraSaludable: '',
          fechaCaducidad: '',
        };
        this.cargarProductos();
      },
      error: error => {
        console.error('ERROR CREANDO PRODUCTO:', error);
      },
    });
  }

  eliminarProducto(id: number): void {
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
