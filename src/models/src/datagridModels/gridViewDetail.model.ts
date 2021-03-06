import { ColumnModel } from './column.model';
import { InputBuilderDefinition } from '../inputBuilderModels';
import { Action } from '../coreModels';

export class GridViewDetail {
  
  
  title: string;
  
  disableCheckboxSelection?: boolean;
  waitForInput?: boolean;

  pageSize?: number;
  InfiniteScroll?: boolean;

  // No save functions
  readOnly?: boolean;

  // Remove unnecessary screen furniture
  isDataIsland?: boolean;

  // Toolbar settings
  hideToolbar?: boolean;

  detailUrl?: string;
  detailTarget?: string;

  serverPagination?: boolean;
  serverSorting?: boolean;
  serverGrouping?: boolean;

  defaultSort?: string;

  columns: Array<ColumnModel>;
  configuredColumns?: Array<ColumnModel>;
  isActionColumnSplitButton?: boolean;

  filtersLocation?: string;

  filters?: InputBuilderDefinition;

  selectDataSourceName?: string;

  actions?: Array<Action>;
}
