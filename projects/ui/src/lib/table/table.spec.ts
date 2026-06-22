import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { UiTable } from './table';
import { TableColumn } from './table.types';

interface Row {
  id: number;
  name: string;
}

describe('UiTable', () => {
  let fixture: ComponentFixture<UiTable<Row>>;
  let component: UiTable<Row>;

  const columns: TableColumn<Row>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '80px' },
    { key: 'name', header: 'Name', sortable: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTable],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTable<Row>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render configured columns and rows', async () => {
    fixture.componentRef.setInput('config', { columns });
    fixture.componentRef.setInput('data', [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('th[mat-header-cell]').length).toBe(2);
    expect(el.textContent).toContain('Alpha');
    expect(el.textContent).toContain('Beta');
  });

  it('should add a trailing actions column when actions are configured', async () => {
    fixture.componentRef.setInput('config', {
      columns,
      actions: [{ id: 'edit', label: 'Edit', icon: 'edit' }],
    });
    fixture.componentRef.setInput('data', [{ id: 1, name: 'Alpha' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['displayedColumns']()).toContain('__actions');
  });

  it('should show the empty message when there is no data', async () => {
    fixture.componentRef.setInput('config', { columns, emptyMessage: 'Nothing here' });
    fixture.componentRef.setInput('data', []);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nothing here');
  });
});
