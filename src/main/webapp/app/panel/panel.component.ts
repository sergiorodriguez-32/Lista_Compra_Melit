import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'jhi-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
