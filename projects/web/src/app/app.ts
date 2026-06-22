import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Moby Angular Workspace');
  protected readonly sidenavOpen = signal(true);

  /** Side menu entries — one per component exposed by the `ui` library. */
  protected readonly components = signal<NavItem[]>([
    { label: 'Data Table', icon: 'table_chart', path: '/components/table' },
    { label: 'Card', icon: 'dashboard', path: '/components/card' },
  ]);

  protected toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }
}
