import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IItemLista } from './item-lista.model';

@Injectable({
  providedIn: 'root',
})
export class ItemListaService {
  private http = inject(HttpClient);
  private resourceUrl = 'api/item-listas';

  createItemLista(itemLista: IItemLista): Observable<IItemLista> {
    return this.http.post<IItemLista>(this.resourceUrl, itemLista);
  }
}
