import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { PasswordResetInitService } from './password-reset-init.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jhi-password-reset-init',
  imports: [TranslateDirective, TranslateModule, AlertError, ReactiveFormsModule],
  templateUrl: './password-reset-init.html',
  styleUrls: ['./password-reset-init.scss'],
})
export default class PasswordResetInit implements AfterViewInit {
  email = viewChild.required<ElementRef>('email');

  readonly success = signal(false);
  resetRequestForm;

  private readonly passwordResetInitService = inject(PasswordResetInitService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly submitted = signal(false);

  constructor() {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    });
  }

  ngAfterViewInit(): void {
    this.email().nativeElement.focus();
  }

  requestReset(): void {
    this.submitted.set(true);

    if (this.resetRequestForm.invalid) {
      return;
    }

    this.passwordResetInitService.save(this.resetRequestForm.get(['email'])!.value).subscribe({
      next: () => this.success.set(true),
      error() {
        // Ignore error
      },
    });
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
