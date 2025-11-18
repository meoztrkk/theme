import { Routes } from '@angular/router';
import { SeoPageListComponent } from './seo-page-list/seo-page-list.component';
import { SeoPageEditComponent } from './seo-page-edit/seo-page-edit.component';

export default [
    {
        path: '',
        component: SeoPageListComponent,
    },
    {
        path: 'new',
        component: SeoPageEditComponent,
    },
    {
        path: ':id',
        component: SeoPageEditComponent,
    },
] as Routes;

