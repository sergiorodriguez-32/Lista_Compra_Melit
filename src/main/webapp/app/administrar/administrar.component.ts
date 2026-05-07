import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdministrarService } from './administrar.service';
import { IAdminUser } from './administrar.model';
import { AccountService } from 'app/core/auth/account.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'jhi-administrar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './administrar.component.html',
  styleUrls: ['./administrar.component.scss'],
})
export class AdministrarComponent implements OnInit {
  usuarios: IAdminUser[] = [];
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  usuarioActualLogin = '';
  currentLang = 'es';

  mostrarConfirmacion = false;
  mensajeConfirmacion = '';
  accionConfirmada: (() => void) | null = null;

  private readonly administrarService: AdministrarService = inject(AdministrarService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly accountService: AccountService = inject(AccountService);
  private readonly translateService: TranslateService = inject(TranslateService);

  ngOnInit(): void {
    this.currentLang = this.translateService.currentLang ?? 'es';

    this.accountService.identity().subscribe(account => {
      this.usuarioActualLogin = account?.login ?? '';
    });

    this.cargarUsuarios();
  }

  cambiarIdioma(lang: string): void {
    this.currentLang = lang;
    this.translateService.use(lang);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' = 'success'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensaje = '';
      this.cdr.detectChanges();
    }, 2500);
  }

  abrirConfirmacion(mensaje: string, accion: () => void): void {
    this.mensajeConfirmacion = mensaje;
    this.accionConfirmada = accion;
    this.mostrarConfirmacion = true;
    this.cdr.detectChanges();
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.mensajeConfirmacion = '';
    this.accionConfirmada = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    if (this.accionConfirmada) {
      this.accionConfirmada();
    }
    this.cancelarConfirmacion();
  }

  cargarUsuarios(): void {
    this.administrarService.getUsuarios().subscribe({
      next: usuarios => {
        this.usuarios = usuarios.map(usuario => ({
          ...usuario,
          mostrarEdicion: false,
        }));
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR CARGANDO USUARIOS:', error);
        this.mostrarMensaje('No se han podido cargar los usuarios.', 'error');
      },
    });
  }

  toggleEdicion(usuario: IAdminUser): void {
    const abrir = !usuario.mostrarEdicion;

    this.usuarios.forEach(u => {
      u.mostrarEdicion = false;
    });

    if (abrir) {
      usuario.mostrarEdicion = true;
      usuario.editFirstName = usuario.firstName ?? '';
      usuario.editLastName = usuario.lastName ?? '';
      usuario.editEmail = usuario.email ?? '';
      usuario.editLangKey = usuario.langKey ?? 'es';
      usuario.editActivated = usuario.activated ?? false;
      usuario.editAuthorities = [...(usuario.authorities ?? [])];
    }
  }

  tieneRolEdicion(usuario: IAdminUser, rol: string): boolean {
    return usuario.editAuthorities?.includes(rol) ?? false;
  }

  toggleRolEdicion(usuario: IAdminUser, rol: string, checked: boolean): void {
    const authorities = new Set(usuario.editAuthorities ?? []);

    if (checked) {
      authorities.add(rol);
    } else {
      authorities.delete(rol);
    }

    if (!authorities.has('ROLE_USER')) {
      authorities.add('ROLE_USER');
    }

    usuario.editAuthorities = Array.from(authorities);
  }

  guardarCambios(usuario: IAdminUser): void {
    const usuarioActualizado: IAdminUser = {
      ...usuario,
      firstName: usuario.editFirstName ?? '',
      lastName: usuario.editLastName ?? '',
      email: usuario.editEmail ?? '',
      langKey: usuario.editLangKey ?? 'es',
      activated: usuario.editActivated ?? false,
      authorities: [...(usuario.editAuthorities ?? ['ROLE_USER'])],
    };

    this.administrarService.actualizarUsuario(usuarioActualizado).subscribe({
      next: () => {
        usuario.firstName = usuarioActualizado.firstName;
        usuario.lastName = usuarioActualizado.lastName;
        usuario.email = usuarioActualizado.email;
        usuario.langKey = usuarioActualizado.langKey;
        usuario.activated = usuarioActualizado.activated;
        usuario.authorities = usuarioActualizado.authorities;
        usuario.mostrarEdicion = false;

        this.mostrarMensaje(`Los cambios de ${usuario.login} se han guardado correctamente.`);
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('ERROR ACTUALIZANDO USUARIO:', error);
        this.mostrarMensaje('No se han podido guardar los cambios del usuario.', 'error');
      },
    });
  }

  eliminarUsuario(usuario: IAdminUser): void {
    if (!usuario.login) {
      return;
    }

    this.abrirConfirmacion(`¿Quieres eliminar al usuario ${usuario.login}?`, () => {
      this.administrarService.eliminarUsuario(usuario.login!).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.mostrarMensaje(`El usuario ${usuario.login} se ha eliminado correctamente.`);
        },
        error: (error: unknown) => {
          console.error('ERROR ELIMINANDO USUARIO:', error);
          this.mostrarMensaje('No se ha podido eliminar el usuario.', 'error');
        },
      });
    });
  }
}
