import { Routes } from '@angular/router';
import { WizardComponent } from 'app/modules/sell/wizard/wizard.component';
import { OffersComponent } from '../offers/offers.component';

export default [
    {
        path: '',
        component: WizardComponent,
    },
    { path: 'offers/:id', component: OffersComponent },
] as Routes;
