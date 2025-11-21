import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';

export default [
    {
        path: '',
        component: UserListComponent,
    },
    {
        path: 'new',
        component: UserFormComponent,
    },
    {
        path: ':id',
        component: UserFormComponent,
    },
] as Routes;

