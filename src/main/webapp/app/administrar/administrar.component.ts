import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrarService } from './administrar.service';
import { IAdminUser } from './administrar.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-administrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrar.component.html',
  styleUrls: ['./administrar.component.scss'],
})
export class AdministrarComponent implements OnInit {
  usuarios: IAdminUser[] = [];
  mensaje = '';
  usuarioActualLogin = '';

  private readonly administrarService = inject(AdministrarService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.usuarioActualLogin = account?.login ?? '';
    });

    this.cargarUsuarios();
  }
  cargarUsuarios(): void {
    this.administrarService.getUsuarios().subscribe({
      next: usuarios => {
        console.log('USUARIOS RECIBIDOS:', usuarios);
        this.usuarios = [...usuarios];
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('ERROR CARGANDO USUARIOS:', error);
        this.mensaje = 'No se han podido cargar los usuarios';
        this.cdr.detectChanges();
      },
    });
  }

  tieneRol(usuario: IAdminUser, rol: string): boolean {
    return usuario.authorities?.includes(rol) ?? false;
  }

  toggleRol(usuario: IAdminUser, rol: string, checked: boolean): void {
    const authorities = new Set(usuario.authorities ?? []);

    if (checked) {
      authorities.add(rol);
    } else {
      authorities.delete(rol);
    }

    if (!authorities.has('ROLE_USER')) {
      authorities.add('ROLE_USER');
    }

    usuario.authorities = Array.from(authorities);
  }

  guardarCambios(usuario: IAdminUser): void {
    this.administrarService.actualizarUsuario(usuario).subscribe({
      next: () => {
        this.mensaje = `Cambios guardados para ${usuario.login}`;
        setTimeout(() => (this.mensaje = ''), 2500);
      },
      error: error => {
        console.error('ERROR ACTUALIZANDO USUARIO:', error);
      },
    });
  }

  eliminarUsuario(usuario: IAdminUser): void {
    if (!usuario.login) {
      return;
    }

    const confirmado = window.confirm(`¿Seguro que quieres eliminar al usuario ${usuario.login}?`);

    if (!confirmado) {
      return;
    }

    this.administrarService.eliminarUsuario(usuario.login).subscribe({
      next: () => {
        this.mensaje = `Usuario ${usuario.login} eliminado correctamente`;
        this.cargarUsuarios();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensaje = '';
          this.cdr.detectChanges();
        }, 2500);
      },
      error: error => {
        console.error('ERROR ELIMINANDO USUARIO:', error);
      },
    });
  }
}
