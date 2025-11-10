import { Routes } from '@angular/router';
import { BlogDetailComponent } from 'app/modules/blog/detail/blog-detail.component';

export default [
    {
        path     : '', // Bu yol parent route'ta zaten ':id' olarak tanımlı
        component: BlogDetailComponent,
    },
] as Routes;
