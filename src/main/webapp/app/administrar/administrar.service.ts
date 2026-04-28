import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAdminUser } from './administrar.model';

@Injectable({
  providedIn: 'root',
})
export class AdministrarService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = 'api/admin/users';

  getUsuarios(): Observable<IAdminUser[]> {
    return this.http.get<IAdminUser[]>(`${this.resourceUrl}?page=0&size=100&sort=login,asc`);
  }

  actualizarUsuario(usuario: IAdminUser): Observable<IAdminUser> {
    return this.http.put<IAdminUser>(this.resourceUrl, usuario);
  }

  eliminarUsuario(login: string) {
    return this.http.delete(`${this.resourceUrl}/${login}`);
  }
}
