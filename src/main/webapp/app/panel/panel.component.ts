import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-panel',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  isAdmin = false;
  currentLang = 'es';

  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.currentLang = this.translateService.currentLang ?? 'es';

    this.accountService.identity().subscribe(account => {
      const authorities = account?.authorities ?? [];
      this.isAdmin = authorities.includes('ROLE_ADMIN');
    });
  }

  cambiarIdioma(lang: string): void {
    this.currentLang = lang;
    this.translateService.use(lang);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
