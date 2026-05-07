import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-home',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export default class Home {
  idiomaActual = 'es';

  private readonly translateService = inject(TranslateService);

  constructor() {
    this.idiomaActual = this.translateService.currentLang || this.translateService.getCurrentLang() || 'es';
  }

  cambiarIdioma(idioma: string): void {
    this.translateService.use(idioma);
    this.idiomaActual = idioma;
  }
}
