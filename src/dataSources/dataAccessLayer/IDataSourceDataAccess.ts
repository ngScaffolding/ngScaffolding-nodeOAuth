import { CoreMenuItem } from '@ngscaffolding/models';
import { DataSourceRequest, DataSetResults } from '@ngscaffolding/models';
import { Observable } from 'rxjs/Rx';
import { BaseDataSource } from '@ngscaffolding/models';

export interface IDataSourceDataAccess {
    getDataSource(name: string): Observable<BaseDataSource>;
}