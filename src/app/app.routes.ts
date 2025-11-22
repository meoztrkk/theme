import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/home'
    {path: '', pathMatch : 'full', redirectTo: 'home'},

    // Redirect signed-in user to the '/home'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'home'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
            {path: 'clarification-text-pdp', loadChildren: () => import('app/modules/landing/clarification-text-pdp/clarification-text-pdp.routes')},
            {path: 'kvkk-clarification-text', loadChildren: () => import('app/modules/landing/kvkk-clarification-text/kvkk-clarification-text.routes')},
        ]
    },

    // Protected user routes (require authentication)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'user/profile', loadChildren: () => import('app/modules/user/profile/profile.routes')},
            {path: 'degerlemelerim', loadChildren: () => import('app/modules/user/degerlemelerim/degerlemelerim.routes')},
            {path: 'randevularim', loadChildren: () => import('app/modules/user/randevularim/randevularim.routes')},
            {path: 'admin/seo-pages', loadChildren: () => import('app/modules/admin/seo-pages/seo-pages.routes')},
            {path: 'admin/seo-global', loadChildren: () => import('app/modules/admin/seo-global/seo-global.routes')},
            {path: 'admin/users', loadChildren: () => import('app/modules/admin/user-management/user-management.routes')},
            {path: 'blog/new', loadChildren: () => import('app/modules/blog/form/blog-form.routes')},
            {path: 'blog/edit/:id', loadChildren: () => import('app/modules/blog/form/blog-form.routes')},
            {path: 'offers/:id', loadChildren: () => import('app/modules/sell/offers/offers.routes')},

        ]
    },

    // Admin routes

    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'wizard', loadChildren: () => import('app/modules/sell/wizard/wizard.routes')},
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'blog', loadChildren: () => import('app/modules/blog/list/blog-list.routes')},
            {path: 'blog/:id', loadChildren: () => import('app/modules/blog/detail/blog-detail.routes')},
        ]
    }
];
