import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'components/table' },
  {
    path: 'components/table',
    title: 'Data Table · Moby',
    loadComponent: () =>
      import('./pages/table-demo/table-demo').then((m) => m.TableDemo),
  },
  {
    path: 'components/card',
    title: 'Card · Moby',
    loadComponent: () =>
      import('./pages/card-demo/card-demo').then((m) => m.CardDemo),
  },
  { path: '**', redirectTo: 'components/table' },
];
