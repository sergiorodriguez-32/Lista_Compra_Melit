import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IDespensaItem } from './despensa.model';

@Injectable({
  providedIn: 'root',
})
export class DespensaService {
  private http = inject(HttpClient);
  private resourceUrl = 'api/item-listas';

  getDespensaItems(): Observable<IDespensaItem[]> {
    return this.http.get<IDespensaItem[]>(this.resourceUrl).pipe(map(items => items.filter(item => item.tipoLista === 'DESPENSA')));
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }

  restarCantidad(id: number, cantidad: number) {
    return this.http.put(`${this.resourceUrl}/${id}/restar`, { cantidad });
  }
}
