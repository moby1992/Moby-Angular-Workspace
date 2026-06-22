import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Context exposed to a custom cell template.
 * Usage:
 * ```html
 * <lib-ui-table [columns]="columns" [data]="rows">
 *   <ng-template uiColumnCell="status" let-row let-value="value">
 *     <span class="badge">{{ value }}</span>
 *   </ng-template>
 * </lib-ui-table>
 * ```
 */
export interface UiColumnCellContext<T = unknown> {
  /** The row object (also available as the implicit `let-row`). */
  $implicit: T;
  /** The formatted display value for the cell. */
  value: string | number | null | undefined;
  /** The zero-based row index within the current page. */
  index: number;
}

/**
 * Marks an `<ng-template>` as the custom cell renderer for a given column key.
 * Lets consumers override how any column's cell is rendered while reusing all
 * the table's paging/sorting/action machinery.
 */
@Directive({
  selector: 'ng-template[uiColumnCell]',
})
export class UiColumnCell<T = unknown> {
  /** The column `key` this template renders. */
  readonly uiColumnCell = input.required<string>();

  readonly template = inject<TemplateRef<UiColumnCellContext<T>>>(TemplateRef);

  /** Type guard helper so the template compiler narrows the context type. */
  static ngTemplateContextGuard<T>(
    _dir: UiColumnCell<T>,
    _ctx: unknown,
  ): _ctx is UiColumnCellContext<T> {
    return true;
  }
}
