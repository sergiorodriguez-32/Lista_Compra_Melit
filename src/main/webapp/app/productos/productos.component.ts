import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProducto } from './productos.model';
import { ProductosService } from './productos.service';
import { ItemListaService } from './item-lista.service';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'jhi-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent implements OnInit {
  productos: IProducto[] = [];

  nuevoProducto: IProducto = this.crearProductoVacio();
  editando = false;

  private readonly productosService = inject(ProductosService);
  private readonly itemListaService = inject(ItemListaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

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

  anadirADespensa(producto: IProducto): void {
    this.itemListaService
      .createItemLista({
        cantidad: producto.cantidadSeleccionada ?? 1,
        unidadMedida: producto.unidadSeleccionada ?? 'UNIDAD',
        tipoLista: 'DESPENSA',
        producto: { id: producto.id },
      })
      .subscribe({
        next: respuesta => {
          console.log('Añadido a despensa:', respuesta);
          alert(`"${producto.nombre}" añadido a despensa`);
        },
        error: error => {
          console.error('ERROR AÑADIENDO A DESPENSA:', error);
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
        next: respuesta => {
          console.log('Añadido a compra:', respuesta);
          alert(`"${producto.nombre}" añadido a compra`);
        },
        error: error => {
          console.error('ERROR AÑADIENDO A COMPRA:', error);
        },
      });
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
