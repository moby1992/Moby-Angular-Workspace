import {
  Component,
  computed,
  contentChildren,
  effect,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatTableModule,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

import { UiColumnCell } from './column-cell.directive';
import {
  DataMode,
  TableAction,
  TableActionEvent,
  TableColumn,
  TablePageEvent,
  TableSortEvent,
} from './table.types';

/**
 * A configuration-driven, reusable data table built on Angular Material.
 *
 * Supports client- or server-side paging and sorting, configurable columns
 * (width, alignment, formatting, sticky), row selection, configurable row
 * actions, custom cell templates, loading and empty states.
 */
@Component({
  selector: 'lib-ui-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTable<T = Record<string, unknown>> {
  // ---- Data & columns ----------------------------------------------------
  /** Row data for the current view. */
  readonly data = input<T[]>([]);
  /** Column configuration. */
  readonly columns = input<TableColumn<T>[]>([]);
  /** Track-by function for efficient row rendering. */
  readonly trackBy = input<(index: number, row: T) => unknown>(
    (index) => index,
  );

  // ---- Paging ------------------------------------------------------------
  /** Show the paginator. */
  readonly pageable = input(true);
  /** `'client'` paginates in-memory; `'server'` emits `pageChange`. */
  readonly pagingMode = input<DataMode>('client');
  /** Page size. */
  readonly pageSize = input(10);
  /** Available page size options. */
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  /** Total row count for server-side paging (defaults to `data.length`). */
  readonly totalCount = input<number | null>(null);

  // ---- Sorting -----------------------------------------------------------
  /** Enable column sorting. */
  readonly sortable = input(true);
  /** `'client'` sorts in-memory; `'server'` emits `sortChange`. */
  readonly sortMode = input<DataMode>('client');

  // ---- Selection ---------------------------------------------------------
  /** Show a leading checkbox column and enable row selection. */
  readonly selectable = input(false);
  /** Allow selecting more than one row at a time. */
  readonly multiSelect = input(true);

  // ---- Misc display ------------------------------------------------------
  /** Show a leading 1-based row index column. */
  readonly showIndex = input(false);
  /** Row action configuration; renders a trailing actions column when set. */
  readonly actions = input<TableAction<T>[]>([]);
  /** Header label for the actions column. */
  readonly actionsHeader = input('Actions');
  /** Collapse actions into an overflow menu instead of inline buttons. */
  readonly actionsAsMenu = input(false);
  /** Show an indeterminate progress bar over the table. */
  readonly loading = input(false);
  /** Message shown when there are no rows. */
  readonly emptyMessage = input('No data to display.');
  /** Make rows visually clickable and emit `rowClick`. */
  readonly clickableRows = input(false);

  // ---- Outputs -----------------------------------------------------------
  readonly action = output<TableActionEvent<T>>();
  readonly pageChange = output<TablePageEvent>();
  readonly sortChange = output<TableSortEvent>();
  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();

  // ---- View / content queries -------------------------------------------
  private readonly paginator = viewChild(MatPaginator);
  private readonly sort = viewChild(MatSort);
  private readonly cellTemplates = contentChildren(UiColumnCell);

  // ---- Internal state ----------------------------------------------------
  private readonly dataSource = new MatTableDataSource<T>([]);
  readonly selection = new SelectionModel<T>(true, []);

  /** Visible columns (config order, excluding hidden). */
  protected readonly visibleColumns = computed(() =>
    this.columns().filter((c) => !c.hidden),
  );

  /** Ordered list of `matColumnDef` names, including system columns. */
  protected readonly displayedColumns = computed(() => {
    const names: string[] = [];
    if (this.selectable()) names.push('__select');
    if (this.showIndex()) names.push('__index');
    names.push(...this.visibleColumns().map((c) => c.key));
    if (this.actions().length > 0) names.push('__actions');
    return names;
  });

  /** Effective row count used by the paginator. */
  protected readonly length = computed(() =>
    this.pagingMode() === 'server'
      ? (this.totalCount() ?? this.data().length)
      : this.data().length,
  );

  /**
   * For client mode we feed the `MatTableDataSource` (so Material handles
   * paging + sorting). For server mode we bind the raw array directly and the
   * host owns paging/sorting via the emitted events.
   */
  protected readonly tableData = computed(() =>
    this.isClientPaged() || this.isClientSorted() ? this.dataSource : this.data(),
  );

  protected readonly hasData = computed(() => this.data().length > 0);

  constructor() {
    // Keep the data source rows in sync with the `data` input.
    effect(() => {
      this.dataSource.data = this.data();
    });

    // Configure a sort accessor that honours per-column overrides.
    this.dataSource.sortingDataAccessor = (row, columnKey) => {
      const column = this.columns().find((c) => c.key === columnKey);
      if (column?.sortAccessor) return column.sortAccessor(row);
      const value = (row as Record<string, unknown>)[columnKey];
      return value as string | number;
    };

    // Attach the paginator only for client-side paging.
    effect(() => {
      const paginator = this.paginator();
      this.dataSource.paginator = this.isClientPaged() ? (paginator ?? null) : null;
    });

    // Attach the sort directive only for client-side sorting.
    effect(() => {
      const sort = this.sort();
      this.dataSource.sort = this.isClientSorted() ? (sort ?? null) : null;
    });

    // Reset selection whenever the visible data changes.
    effect(() => {
      this.data();
      this.selection.clear();
    });
  }

  protected isClientPaged(): boolean {
    return this.pageable() && this.pagingMode() === 'client';
  }

  protected isClientSorted(): boolean {
    return this.sortable() && this.sortMode() === 'client';
  }

  // ---- Template helpers --------------------------------------------------

  protected header(column: TableColumn<T>): string {
    return column.header ?? column.key;
  }

  /** Resolve the formatted display value for a cell. */
  protected display(column: TableColumn<T>, row: T): string {
    if (column.cell) {
      const v = column.cell(row);
      return v == null ? '' : String(v);
    }
    const raw = (row as Record<string, unknown>)[column.key];
    if (raw == null) return '';
    return this.formatValue(raw, column);
  }

  private formatValue(value: unknown, column: TableColumn<T>): string {
    switch (column.type) {
      case 'number':
        return typeof value === 'number'
          ? new Intl.NumberFormat().format(value)
          : String(value);
      case 'currency':
        return typeof value === 'number'
          ? new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: column.currencyCode ?? 'USD',
            }).format(value)
          : String(value);
      case 'date': {
        const date = value instanceof Date ? value : new Date(value as string);
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
      }
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  /** Raw value, used as `value` in custom cell template contexts. */
  protected rawValue(column: TableColumn<T>, row: T): unknown {
    return column.cell ? column.cell(row) : (row as Record<string, unknown>)[column.key];
  }

  protected templateFor(key: string) {
    return this.cellTemplates().find((t) => t.uiColumnCell() === key)?.template ?? null;
  }

  protected visibleActions(row: T): TableAction<T>[] {
    return this.actions().filter((a) => (a.visible ? a.visible(row) : true));
  }

  protected onAction(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    this.action.emit({ action: action.id, row });
  }

  protected onRowClick(row: T): void {
    if (this.clickableRows()) this.rowClick.emit(row);
  }

  protected onPage(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length,
    });
  }

  protected onSort(sort: Sort): void {
    this.sortChange.emit({ active: sort.active, direction: sort.direction });
  }

  // ---- Selection helpers -------------------------------------------------

  protected isAllSelected(): boolean {
    return this.hasData() && this.selection.selected.length === this.data().length;
  }

  protected toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.data());
    }
    this.selectionChange.emit(this.selection.selected);
  }

  protected toggleRow(row: T): void {
    if (!this.multiSelect()) this.selection.clear();
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }
}
