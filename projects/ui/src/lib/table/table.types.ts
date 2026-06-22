/**
 * Public type contracts for the reusable `<lib-ui-table>` component.
 */

/** Horizontal alignment for a column's header and cells. */
export type ColumnAlign = 'start' | 'center' | 'end';

/** Built-in value formatters applied when no custom `cell`/template is given. */
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'boolean';

/** Where paging/sorting work is performed. */
export type DataMode = 'client' | 'server';

/** Sort direction as emitted by Material's `MatSort`. */
export type SortDirection = 'asc' | 'desc' | '';

/** Configuration for a single table column. */
export interface TableColumn<T = unknown> {
  /** Unique column identifier; also the default property accessor on the row. */
  key: string;
  /** Header label. Defaults to `key` when omitted. */
  header?: string;
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** CSS width, e.g. `'120px'` or `'20%'`. */
  width?: string;
  /** Header + cell alignment. */
  align?: ColumnAlign;
  /** Built-in formatter to apply to the raw value. */
  type?: ColumnType;
  /** Format string passed to the relevant Angular pipe (date/number/currency). */
  format?: string;
  /** Currency code used when `type === 'currency'`. */
  currencyCode?: string;
  /** Custom accessor returning the display value for a row. */
  cell?: (row: T) => string | number | null | undefined;
  /** Custom accessor returning the raw value used for client-side sorting. */
  sortAccessor?: (row: T) => string | number;
  /** Pin the column to the start while scrolling horizontally. */
  sticky?: boolean;
  /** Extra CSS class(es) applied to the header cell. */
  headerClass?: string;
  /** Extra CSS class(es) applied to body cells. */
  cellClass?: string;
  /** Hide the column without removing it from config. */
  hidden?: boolean;
}

/** Configuration for a single row action (rendered in the actions column). */
export interface TableAction<T = unknown> {
  /** Identifier emitted with the `action` output. */
  id: string;
  /** Tooltip / menu label. */
  label: string;
  /** Material icon name. */
  icon?: string;
  /** Theme color for the action button. */
  color?: 'primary' | 'accent' | 'warn';
  /** Hide the action for a given row. */
  visible?: (row: T) => boolean;
  /** Disable the action for a given row. */
  disabled?: (row: T) => boolean;
}

/** Payload emitted when a row action is triggered. */
export interface TableActionEvent<T = unknown> {
  action: string;
  row: T;
}

/** Payload emitted on paging changes (mainly relevant for server-side paging). */
export interface TablePageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

/** Payload emitted on sorting changes (mainly relevant for server-side sorting). */
export interface TableSortEvent {
  active: string;
  direction: SortDirection;
}

/**
 * Consolidated configuration for `<lib-ui-table>`. Everything except the row
 * `data` (which is passed separately) is set through this single object, so a
 * consumer binds just `[data]` and `[config]`. Every field is optional and
 * falls back to a sensible default.
 */
export interface UiTableConfig<T = unknown> {
  /** Column configuration (order = display order). */
  columns?: TableColumn<T>[];
  /** Track-by function for efficient row rendering. */
  trackBy?: (index: number, row: T) => unknown;

  // Paging
  /** Show the paginator. Default `true`. */
  pageable?: boolean;
  /** `'client'` paginates in-memory; `'server'` emits `pageChange`. Default `'client'`. */
  pagingMode?: DataMode;
  /** Page size. Default `10`. */
  pageSize?: number;
  /** Available page size options. Default `[5, 10, 25, 50]`. */
  pageSizeOptions?: number[];
  /** Total row count for server-side paging (defaults to `data.length`). */
  totalCount?: number | null;

  // Sorting
  /** Enable column sorting. Default `true`. */
  sortable?: boolean;
  /** `'client'` sorts in-memory; `'server'` emits `sortChange`. Default `'client'`. */
  sortMode?: DataMode;

  // Selection
  /** Show a leading checkbox column and enable row selection. Default `false`. */
  selectable?: boolean;
  /** Allow selecting more than one row at a time. Default `true`. */
  multiSelect?: boolean;

  // Display
  /** Show a leading 1-based row index column. Default `false`. */
  showIndex?: boolean;
  /** Row actions; renders a trailing actions column when non-empty. */
  actions?: TableAction<T>[];
  /** Header label for the actions column. Default `'Actions'`. */
  actionsHeader?: string;
  /** Collapse actions into an overflow menu instead of inline buttons. Default `false`. */
  actionsAsMenu?: boolean;
  /** Show an indeterminate progress bar over the table. Default `false`. */
  loading?: boolean;
  /** Message shown when there are no rows. */
  emptyMessage?: string;
  /** Make rows visually clickable and emit `rowClick`. Default `false`. */
  clickableRows?: boolean;
}

/** Fully-resolved table configuration (all defaults applied). */
export type ResolvedTableConfig<T = unknown> = Required<UiTableConfig<T>>;

/** Default configuration merged under any consumer-supplied `config`. */
export const UI_TABLE_DEFAULTS: ResolvedTableConfig = {
  columns: [],
  trackBy: (index: number) => index,
  pageable: true,
  pagingMode: 'client',
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  totalCount: null,
  sortable: true,
  sortMode: 'client',
  selectable: false,
  multiSelect: true,
  showIndex: false,
  actions: [],
  actionsHeader: 'Actions',
  actionsAsMenu: false,
  loading: false,
  emptyMessage: 'No data to display.',
  clickableRows: false,
};
