import { Component, OnInit, inject } from '@angular/core';
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

  ngOnInit(): void {
    this.productosService.getProductos().subscribe({
      next: productos => {
        console.log('PRODUCTOS API:', productos);
        this.productos = productos;
      },
      error: error => {
        console.error('ERROR API PRODUCTOS:', error);
      },
    });
  }
}
