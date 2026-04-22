import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProducto } from './productos.model';
import { ProductosService } from './productos.service';

@Component({
  selector: 'jhi-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  productos: IProducto[] = [];
  private productosService = inject(ProductosService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
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
}
