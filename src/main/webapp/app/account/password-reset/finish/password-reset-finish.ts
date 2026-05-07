import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import PasswordStrengthBar from 'app/account/password/password-strength-bar/password-strength-bar';
import { TranslateDirective } from 'app/shared/language';

import { PasswordResetFinishService } from './password-reset-finish.service';

@Component({
  selector: 'jhi-password-reset-finish',
  imports: [TranslateDirective, TranslateModule, RouterLink, ReactiveFormsModule, PasswordStrengthBar],
  templateUrl: './password-reset-finish.html',
  styleUrls: ['./password-reset-finish.scss'],
})
export default class PasswordResetFinish implements OnInit, AfterViewInit {
  newPassword = viewChild.required<ElementRef>('newPassword');

  readonly initialized = signal(false);
  readonly doNotMatch = signal(false);
  readonly error = signal(false);
  readonly success = signal(false);
  readonly key = signal('');
  readonly submitted = signal(false);

  idiomaActual = 'es';

  private readonly router = inject(Router);
  private readonly passwordResetFinishService = inject(PasswordResetFinishService);
  private readonly route = inject(ActivatedRoute);
  private readonly translateService = inject(TranslateService);

  passwordForm = new FormGroup({
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  constructor() {
    this.idiomaActual = this.translateService.currentLang || this.translateService.getCurrentLang() || 'es';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.key) {
        this.key.set(params.key);
      }
      this.initialized.set(true);
    });
  }

  ngAfterViewInit(): void {
    this.newPassword().nativeElement.focus();
  }

  cambiarIdioma(idioma: string): void {
    this.translateService.use(idioma);
    this.idiomaActual = idioma;
  }

  finishReset(): void {
    this.submitted.set(true);
    this.doNotMatch.set(false);
    this.error.set(false);

    if (this.passwordForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword === confirmPassword) {
      this.passwordResetFinishService.save(this.key(), newPassword).subscribe({
        next: () => this.success.set(true),
        error: () => this.error.set(true),
      });
    } else {
      this.doNotMatch.set(true);
    }
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
