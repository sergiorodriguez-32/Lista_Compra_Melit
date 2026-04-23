import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'jhi-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {}
