import { Component, computed, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TableAction,
  TableActionEvent,
  TableColumn,
  TablePageEvent,
  TableSortEvent,
  UiColumnCell,
  UiTable,
} from 'ui';

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
  startDate: Date;
  active: boolean;
  status: 'Active' | 'On leave' | 'Terminated';
}

const DEPARTMENTS = ['Engineering', 'Design', 'Sales', 'Support', 'Finance'];
const STATUSES: Employee['status'][] = ['Active', 'On leave', 'Terminated'];

/** Deterministic mock dataset so the demo is stable across reloads. */
function makeEmployees(count: number): Employee[] {
  const rows: Employee[] = [];
  for (let i = 1; i <= count; i++) {
    const status = STATUSES[i % STATUSES.length];
    rows.push({
      id: i,
      name: `Employee ${i.toString().padStart(3, '0')}`,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      salary: 45000 + (i % 12) * 5000,
      startDate: new Date(2018, i % 12, ((i * 7) % 27) + 1),
      active: status === 'Active',
      status,
    });
  }
  return rows;
}

@Component({
  selector: 'app-table-demo',
  imports: [MatTabsModule, UiTable, UiColumnCell],
  templateUrl: './table-demo.html',
  styleUrl: './table-demo.css',
})
export class TableDemo {
  private readonly snackBar = inject(MatSnackBar);

  // ---- Shared column + action configuration -----------------------------
  protected readonly columns: TableColumn<Employee>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '72px', align: 'end' },
    { key: 'name', header: 'Name', sortable: true, width: '180px', sticky: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'salary', header: 'Salary', type: 'currency', sortable: true, align: 'end' },
    { key: 'startDate', header: 'Start date', type: 'date', sortable: true },
    { key: 'status', header: 'Status', sortable: true, align: 'center' },
  ];

  protected readonly actions: TableAction<Employee>[] = [
    { id: 'view', label: 'View', icon: 'visibility', color: 'primary' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      disabled: (row) => row.status === 'Terminated',
    },
  ];

  // ---- Client-side data (table paginates & sorts in-memory) -------------
  protected readonly clientData = signal(makeEmployees(43));

  // ---- Server-side data (host owns paging & sorting) --------------------
  private readonly fullData = makeEmployees(200);
  protected readonly serverTotal = this.fullData.length;
  private readonly serverPage = signal<TablePageEvent>({
    pageIndex: 0,
    pageSize: 10,
    length: this.fullData.length,
  });
  private readonly serverSort = signal<TableSortEvent>({ active: '', direction: '' });
  protected readonly serverLoading = signal(false);

  /** Recompute the current "server" page whenever paging/sorting changes. */
  protected readonly serverRows = computed(() => {
    const { active, direction } = this.serverSort();
    const { pageIndex, pageSize } = this.serverPage();

    let rows = [...this.fullData];
    if (active && direction) {
      const dir = direction === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a[active as keyof Employee];
        const bv = b[active as keyof Employee];
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    const start = pageIndex * pageSize;
    return rows.slice(start, start + pageSize);
  });

  protected readonly selectedCount = signal(0);

  // ---- Event handlers ----------------------------------------------------
  protected onAction(event: TableActionEvent<Employee>): void {
    this.snackBar.open(`${event.action} → ${event.row.name}`, 'Dismiss', {
      duration: 2500,
    });
  }

  protected onRowClick(row: Employee): void {
    this.snackBar.open(`Row clicked: ${row.name}`, 'Dismiss', { duration: 2000 });
  }

  protected onSelectionChange(rows: Employee[]): void {
    this.selectedCount.set(rows.length);
  }

  protected onServerPage(event: TablePageEvent): void {
    this.serverLoading.set(true);
    this.serverPage.set(event);
    // Simulate a network round-trip.
    setTimeout(() => this.serverLoading.set(false), 350);
  }

  protected onServerSort(event: TableSortEvent): void {
    this.serverLoading.set(true);
    this.serverSort.set(event);
    setTimeout(() => this.serverLoading.set(false), 350);
  }

  protected badgeClass(status: Employee['status']): string {
    switch (status) {
      case 'Active':
        return 'badge badge--active';
      case 'On leave':
        return 'badge badge--leave';
      default:
        return 'badge badge--terminated';
    }
  }
}
