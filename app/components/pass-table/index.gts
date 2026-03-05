import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import type Owner from '@ember/owner';

const eq = (a: unknown, b: unknown) => a === b;
const gt = (a: unknown, b: unknown) => Number(a) > Number(b);

export interface TableChangeParams {
  page: number;
  pageSize: number;
  filter: string;
}

interface PassTableSignature {
  Args: {
    data: unknown[];
    page: number;
    pageSize: number;
    pageSizeValues?: number[];
    totalItems?: number;
    totalPages?: number;
    showFilter?: boolean;
    filterValue?: string;
    onChange: (params: TableChangeParams) => void;
  };
  Blocks: {
    header: [];
    row: [record: unknown];
  };
}

export default class PassTable extends Component<PassTableSignature> {
  @tracked _filterText: string;
  _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(owner: Owner, args: PassTableSignature['Args']) {
    super(owner, args);
    this._filterText = args.filterValue ?? '';
  }

  get showFilter(): boolean {
    return this.args.showFilter !== false;
  }

  get pageSizeValues(): number[] {
    return this.args.pageSizeValues ?? [10, 25, 50];
  }

  get records(): unknown[] {
    return this.args.data ?? [];
  }

  get totalItemsDisplay(): number {
    return this.args.totalItems ?? 0;
  }

  get showingStart(): number {
    if (!this.args.totalItems) return 0;
    return (this.args.page - 1) * this.args.pageSize + 1;
  }

  get showingEnd(): number {
    const end = this.args.page * this.args.pageSize;
    const total = this.args.totalItems ?? 0;
    return end > total ? total : end;
  }

  get hasPrevPage(): boolean {
    return this.args.page > 1;
  }

  get hasNextPage(): boolean {
    return this.args.page < (this.args.totalPages ?? 1);
  }

  get showPagination(): boolean {
    // Always show the pagination footer (matches EMT behavior).
    return true;
  }

  get isFilterEmpty(): boolean {
    return !this._filterText || this._filterText.length === 0;
  }

  /** Show a select for Rows when total items exceed the smallest page size value. */
  get showPageSizeSelect(): boolean {
    const total = this.args.totalItems ?? 0;
    const minSize = Math.min(...this.pageSizeValues);
    return total > minSize;
  }

  /** Show a select for Page when there's more than one page. */
  get showPageNumberSelect(): boolean {
    return (this.args.totalPages ?? 1) > 1;
  }

  @action
  onFilterInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this._filterText = value;
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.args.onChange({ page: 1, pageSize: this.args.pageSize, filter: value });
    }, 300);
  }

  @action
  clearFilter() {
    this._filterText = '';
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this.args.onChange({ page: 1, pageSize: this.args.pageSize, filter: '' });
  }

  @action
  onPageSizeChange(event: Event) {
    const newSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.args.onChange({ page: 1, pageSize: newSize, filter: this._filterText });
  }

  @action
  goToFirstPage() {
    if (this.hasPrevPage) {
      this.args.onChange({ page: 1, pageSize: this.args.pageSize, filter: this._filterText });
    }
  }

  @action
  prevPage() {
    if (this.hasPrevPage) {
      this.args.onChange({ page: this.args.page - 1, pageSize: this.args.pageSize, filter: this._filterText });
    }
  }

  @action
  nextPage() {
    if (this.hasNextPage) {
      this.args.onChange({ page: this.args.page + 1, pageSize: this.args.pageSize, filter: this._filterText });
    }
  }

  @action
  goToLastPage() {
    const totalPages = this.args.totalPages ?? 1;
    if (this.hasNextPage) {
      this.args.onChange({ page: totalPages, pageSize: this.args.pageSize, filter: this._filterText });
    }
  }

  @action
  goToPage(event: Event) {
    const pageNum = parseInt((event.target as HTMLSelectElement).value, 10);
    this.args.onChange({ page: pageNum, pageSize: this.args.pageSize, filter: this._filterText });
  }

  willDestroy(): void {
    super.willDestroy();
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
  }

  // prettier-ignore
  <template>
    {{! template-lint-disable no-invalid-interactive require-input-label }}
    <div class='models-table-wrapper'>
      {{#if this.showFilter}}
        <div class='globalSearch input-group'>
          <label class='input-group-text'>Search:</label>
          <input
            type='text'
            class='filterString form-control'
            value={{this._filterText}}
            {{on 'input' this.onFilterInput}}
          />
          <button
            type='button'
            class='clearFilterIcon btn btn-outline-secondary btn-link'
            disabled={{this.isFilterEmpty}}
            {{on 'click' this.clearFilter}}
          >
            <i class='fa fa-fw fa-times'></i>
            <span class='emt-sr-only'>Clear filter</span>
          </button>
        </div>
      {{/if}}

      <table class='table'>
        <thead>
          <tr>
            {{yield to='header'}}
          </tr>
        </thead>
        <tbody>
          {{#each this.records as |record|}}
            <tr>
              {{yield record to='row'}}
            </tr>
          {{else}}
            <tr>
              <td colspan='99'>
                <span class='nodata-placeholder'>No data found</span>
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>

      {{#if this.showPagination}}
        <div class='row'>
          <div class='table-summary col-5'>
            <div class='input-group'>
              <label class='input-group-text'>Show {{this.showingStart}} - {{this.showingEnd}} of {{this.totalItemsDisplay}}</label>
              <button
                type='button'
                class='clearFilters btn btn-outline-secondary btn-link'
                disabled={{this.isFilterEmpty}}
                {{on 'click' this.clearFilter}}
              >
                <i class='fa fa-fw fa-times'></i>
                <span class='emt-sr-only'>Clear all filters</span>
              </button>
            </div>
          </div>
          <div class='col-2'>
            <div class='input-group w-100'>
              <label class='input-group-text'>Rows:</label>
              {{#if this.showPageSizeSelect}}
                <select
                  class='form-select'
                  {{on 'change' this.onPageSizeChange}}
                >
                  {{#each this.pageSizeValues as |size|}}
                    <option value={{size}} selected={{eq size @pageSize}}>
                      {{size}}
                    </option>
                  {{/each}}
                </select>
              {{else}}
                <span class='input-group-text flex-grow-1'>{{@pageSize}}</span>
              {{/if}}
            </div>
          </div>
          <div class='table-nav col-5'>
            <div class='btn-group pull-right'>
              <button
                type='button'
                class='{{if this.hasPrevPage "enabled" "disabled"}} btn btn-secondary'
                disabled={{if this.hasPrevPage false true}}
                {{on 'click' this.goToFirstPage}}
              >
                <i class='fa fa-fw fa-angle-double-left'></i>
              </button>
              <button
                type='button'
                class='{{if this.hasPrevPage "enabled" "disabled"}} btn btn-secondary'
                disabled={{if this.hasPrevPage false true}}
                {{on 'click' this.prevPage}}
              >
                <i class='fa fa-fw fa-angle-left'></i>
              </button>
              <button
                type='button'
                class='{{if this.hasNextPage "enabled" "disabled"}} btn btn-secondary'
                disabled={{if this.hasNextPage false true}}
                {{on 'click' this.nextPage}}
              >
                <i class='fa fa-fw fa-angle-right'></i>
              </button>
              <button
                type='button'
                class='{{if this.hasNextPage "enabled" "disabled"}} btn btn-secondary'
                disabled={{if this.hasNextPage false true}}
                {{on 'click' this.goToLastPage}}
              >
                <i class='fa fa-fw fa-angle-double-right'></i>
              </button>
            </div>
            <div class='pull-right'>
              <div class='input-group'>
                <label class='input-group-text'>Page:</label>
                {{#if this.showPageNumberSelect}}
                  <select class='form-select' {{on 'change' this.goToPage}}>
                    {{#each (pageRange @totalPages) as |pageNum|}}
                      <option value={{pageNum}} selected={{eq pageNum @page}}>
                        {{pageNum}}
                      </option>
                    {{/each}}
                  </select>
                {{else}}
                  <span class='input-group-text'>{{@page}}</span>
                {{/if}}
              </div>
            </div>
          </div>
        </div>
      {{/if}}
    </div>
  </template>
}

function pageRange(totalPages: unknown): number[] {
  const count = Math.max(Number(totalPages) || 0, 1);
  const result: number[] = [];
  for (let i = 1; i <= count; i++) {
    result.push(i);
  }
  return result;
}
