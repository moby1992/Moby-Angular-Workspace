import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-ui-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="max-w-sm" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="py-2">
        <ng-content />
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-flat-button>
          <mat-icon>check</mat-icon>
          {{ actionLabel() }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: ``,
})
export class UiCard {
  readonly title = input('Card title');
  readonly subtitle = input('Card subtitle');
  readonly actionLabel = input('Action');
}
