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
