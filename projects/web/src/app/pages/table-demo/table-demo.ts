import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DataMode,
  TableAction,
  TableActionEvent,
  TableColumn,
  TablePageEvent,
  TableSortEvent,
  UiColumnCell,
  UiTable,
  UiTableConfig,
} from 'ui';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  location: string;
  salary: number;
  rating: number;
  startDate: Date;
  lastActive: Date;
  active: boolean;
  status: 'Active' | 'On leave' | 'Terminated';
}

const DEPARTMENTS = ['Engineering', 'Design', 'Sales', 'Support', 'Finance'];
const ROLES = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];
const LOCATIONS = ['London', 'Berlin', 'Toronto', 'Austin', 'Singapore'];
const STATUSES: Employee['status'][] = ['Active', 'On leave', 'Terminated'];

/** Deterministic mock dataset so the demo is stable across reloads. */
function makeEmployees(count: number): Employee[] {
  const rows: Employee[] = [];
  for (let i = 1; i <= count; i++) {
    const status = STATUSES[i % STATUSES.length];
    const name = `Employee ${i.toString().padStart(3, '0')}`;
    rows.push({
      id: i,
      name,
      email: `employee${i}@moby.dev`,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      role: ROLES[i % ROLES.length],
      location: LOCATIONS[i % LOCATIONS.length],
      salary: 45000 + (i % 12) * 5000,
      rating: (i % 5) + 1,
      startDate: new Date(2018, i % 12, ((i * 7) % 27) + 1),
      lastActive: new Date(2026, i % 6, ((i * 3) % 27) + 1),
      active: status === 'Active',
      status,
    });
  }
  return rows;
}

/** All the inputs the playground exposes, mirrored from `UiTable`. */
interface PlaygroundConfig {
  pageable: boolean;
  pagingMode: DataMode;
  pageSize: number;
  sortable: boolean;
  sortMode: DataMode;
  selectable: boolean;
  multiSelect: boolean;
  showIndex: boolean;
  clickableRows: boolean;
  withActions: boolean;
  actionsAsMenu: boolean;
  loading: boolean;
  emptyData: boolean;
  rowCount: number;
  actionsHeader: string;
  emptyMessage: string;
}

@Component({
  selector: 'app-table-demo',
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    UiTable,
    UiColumnCell,
  ],
  templateUrl: './table-demo.html',
  styleUrl: './table-demo.css',
})
export class TableDemo {
  private readonly snackBar = inject(MatSnackBar);

  // ---- Configurable inputs (the control panel binds to this) ------------
  protected readonly config = signal<PlaygroundConfig>({
    pageable: true,
    pagingMode: 'client',
    pageSize: 10,
    sortable: true,
    sortMode: 'client',
    selectable: true,
    multiSelect: true,
    showIndex: true,
    clickableRows: true,
    withActions: true,
    actionsAsMenu: false,
    loading: false,
    emptyData: false,
    rowCount: 50,
    actionsHeader: 'Actions',
    emptyMessage: 'No data to display.',
  });

  protected readonly pageSizeOptions = [5, 10, 25, 50, 100];
  protected readonly rowCountOptions = [5, 25, 50, 200, 1000];

  /** Generic setter so each control is a one-liner in the template. */
  protected update<K extends keyof PlaygroundConfig>(
    key: K,
    value: PlaygroundConfig[K],
  ): void {
    this.config.update((c) => ({ ...c, [key]: value }));
    // Re-baseline server paging when the shape of the data/page changes.
    if (key === 'pageSize' || key === 'pagingMode' || key === 'rowCount' || key === 'emptyData') {
      this.serverPage.set({ pageIndex: 0, pageSize: this.config().pageSize, length: 0 });
    }
  }

  // ---- Full column catalogue (every column is toggleable) ----------------
  protected readonly allColumns: TableColumn<Employee>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '70px', align: 'end' },
    { key: 'name', header: 'Name', sortable: true, width: '170px', sticky: true },
    { key: 'email', header: 'Email', sortable: true, width: '200px' },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'role', header: 'Role', sortable: true, width: '110px' },
    { key: 'location', header: 'Location', sortable: true },
    { key: 'salary', header: 'Salary', type: 'currency', sortable: true, align: 'end' },
    { key: 'rating', header: 'Rating', type: 'number', sortable: true, align: 'center', width: '120px' },
    { key: 'startDate', header: 'Start date', type: 'date', sortable: true },
    { key: 'lastActive', header: 'Last active', type: 'date', sortable: true },
    { key: 'active', header: 'Active', type: 'boolean', sortable: true, align: 'center', width: '90px' },
    { key: 'status', header: 'Status', sortable: true, align: 'center', width: '130px' },
  ];

  /** Per-column visibility, all on by default. */
  protected readonly columnVisibility = signal<Record<string, boolean>>(
    Object.fromEntries(this.allColumns.map((c) => [c.key, true])),
  );

  protected toggleColumn(key: string, visible: boolean): void {
    this.columnVisibility.update((v) => ({ ...v, [key]: visible }));
  }

  /** Columns passed to the table, with `hidden` derived from visibility. */
  protected readonly columns = computed<TableColumn<Employee>[]>(() => {
    const vis = this.columnVisibility();
    return this.allColumns.map((c) => ({ ...c, hidden: !vis[c.key] }));
  });

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

  protected readonly noActions: TableAction<Employee>[] = [];

  // ---- Data --------------------------------------------------------------
  /** The "source of truth" dataset, sized by the rowCount control. */
  private readonly dataset = computed(() =>
    this.config().emptyData ? [] : makeEmployees(this.config().rowCount),
  );

  // Server-side paging/sorting state (used when pagingMode === 'server').
  private readonly serverPage = signal<TablePageEvent>({
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  });
  private readonly serverSort = signal<TableSortEvent>({ active: '', direction: '' });

  /** Current "server" page: host applies sorting + slicing itself. */
  private readonly serverRows = computed(() => {
    const { active, direction } = this.serverSort();
    const { pageIndex, pageSize } = this.serverPage();
    let rows = [...this.dataset()];
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

  /** What actually gets bound to the table's `[data]`. */
  protected readonly tableData = computed(() => {
    const c = this.config();
    return c.pageable && c.pagingMode === 'server' ? this.serverRows() : this.dataset();
  });

  protected readonly totalCount = computed(() => this.dataset().length);

  /** Everything the playground controls, assembled into one table config. */
  protected readonly tableConfig = computed<UiTableConfig<Employee>>(() => {
    const c = this.config();
    return {
      columns: this.columns(),
      actions: c.withActions ? this.actions : this.noActions,
      actionsHeader: c.actionsHeader,
      actionsAsMenu: c.actionsAsMenu,
      pageable: c.pageable,
      pagingMode: c.pagingMode,
      pageSize: c.pageSize,
      pageSizeOptions: this.pageSizeOptions,
      totalCount: this.totalCount(),
      sortable: c.sortable,
      sortMode: c.sortMode,
      selectable: c.selectable,
      multiSelect: c.multiSelect,
      showIndex: c.showIndex,
      clickableRows: c.clickableRows,
      loading: c.loading,
      emptyMessage: c.emptyMessage,
    };
  });

  // ---- Live output inspection -------------------------------------------
  protected readonly selectedCount = signal(0);
  protected readonly events = signal<string[]>([]);

  private log(message: string): void {
    const stamp = new Date().toLocaleTimeString();
    this.events.update((list) => [`${stamp}  ${message}`, ...list].slice(0, 8));
  }

  protected clearLog(): void {
    this.events.set([]);
  }

  // ---- Event handlers ----------------------------------------------------
  protected onAction(event: TableActionEvent<Employee>): void {
    this.log(`action: "${event.action}" on ${event.row.name}`);
    this.snackBar.open(`${event.action} → ${event.row.name}`, 'Dismiss', { duration: 2000 });
  }

  protected onRowClick(row: Employee): void {
    this.log(`rowClick: ${row.name}`);
  }

  protected onSelectionChange(rows: Employee[]): void {
    this.selectedCount.set(rows.length);
    this.log(`selectionChange: ${rows.length} row(s)`);
  }

  protected onPage(event: TablePageEvent): void {
    this.log(`pageChange: index=${event.pageIndex}, size=${event.pageSize}`);
    if (this.config().pagingMode === 'server') {
      this.simulateServer(() => this.serverPage.set(event));
    }
  }

  protected onSort(event: TableSortEvent): void {
    this.log(`sortChange: ${event.active || '—'} ${event.direction || '(cleared)'}`);
    if (this.config().sortMode === 'server') {
      this.simulateServer(() => this.serverSort.set(event));
    }
  }

  /** Briefly flips the loading flag to mimic a backend round-trip. */
  private simulateServer(apply: () => void): void {
    this.update('loading', true);
    apply();
    setTimeout(() => this.update('loading', false), 300);
  }

  // ---- Custom cell helpers ----------------------------------------------
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

  protected stars(rating: number): string {
    return '★★★★★☆☆☆☆☆'.slice(5 - rating, 10 - rating);
  }
}
