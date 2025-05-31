import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewComponent } from './view/map-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MapViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'greencity';
}
