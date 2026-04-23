import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ICompraItem } from './compra.model';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  private http = inject(HttpClient);
  private resourceUrl = 'api/item-listas';

  getCompraItems(): Observable<ICompraItem[]> {
    return this.http.get<ICompraItem[]>(this.resourceUrl).pipe(map(items => items.filter(item => item.tipoLista === 'COMPRA')));
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }

  restarCantidad(id: number, cantidad: number) {
    return this.http.put(`${this.resourceUrl}/${id}/restar`, { cantidad });
  }
}
