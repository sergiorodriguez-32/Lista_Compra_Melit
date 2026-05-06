import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  isAdmin = false;

  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      const authorities = account?.authorities ?? [];
      this.isAdmin = authorities.includes('ROLE_ADMIN');
    });
  }

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
