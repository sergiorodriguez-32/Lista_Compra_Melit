import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProducto } from './productos.model';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private http = inject(HttpClient);
  private resourceUrl = 'api/productos';

  getProductos(): Observable<IProducto[]> {
    return this.http.get<IProducto[]>(this.resourceUrl);
  }

  createProducto(producto: IProducto): Observable<IProducto> {
    return this.http.post<IProducto>(this.resourceUrl, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
