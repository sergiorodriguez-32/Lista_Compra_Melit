import { Component, OnInit, Renderer2, RendererFactory2, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { LangChangeEvent, TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';
import { filter } from 'rxjs/operators';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, RouterLink, TranslateModule],
})
export default class Main implements OnInit {
  private readonly renderer: Renderer2;

  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly loginService = inject(LoginService);
  private readonly rootRenderer = inject(RendererFactory2);

  showAppShell = false;
  currentLang = 'es';
  currentAccount: Account | null = null;
  isAdmin = false;
  mostrarMenuUsuario = false;

  constructor() {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.cargarUsuarioActual();

    this.currentLang = this.translateService.currentLang ?? this.translateService.getDefaultLang() ?? 'es';
    this.actualizarShellSegunRuta(this.router.url);

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const navigation = event as NavigationEnd;
      this.actualizarShellSegunRuta(navigation.urlAfterRedirects);
      this.mostrarMenuUsuario = false;
      this.cargarUsuarioActual();
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.currentLang = langChangeEvent.lang;
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }

  cargarUsuarioActual(): void {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;

      const authorities = account?.authorities ?? [];
      this.isAdmin = authorities.includes('ROLE_ADMIN');
    });
  }

  actualizarShellSegunRuta(url: string): void {
    this.showAppShell =
      url.startsWith('/productos') ||
      url.startsWith('/despensa') ||
      url.startsWith('/compra') ||
      url.startsWith('/administrar') ||
      url.startsWith('/account/settings') ||
      url.startsWith('/account/password');
  }

  cambiarIdioma(lang: string): void {
    this.currentLang = lang;
    this.translateService.use(lang);
  }

  toggleMenuUsuario(): void {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
