import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
    IdNameDto,
    SellWizardService,
} from 'app/core/services/sell-wizard.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
    styles: ' .mat-mdc-form-field-subscript-wrapper {  display: none;}',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        MatFormField,
        MatIcon,
        MatLabel,
        MatSelect,
        MatOption,
        RouterLink,
        RouterLinkActive,
    ],
})
export class ExampleComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    years: number[] = [];
    brands: IdNameDto[] = [];
    selectedYear: number | null = null;
    selectedBrandId: number | null = null;

    /**
     * Constructor
     */
    constructor(
        private wiz: SellWizardService,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.wiz.getYears().subscribe((y) => (this.years = y));
        this.wiz.getBrands().subscribe((b) => (this.brands = b));
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

AracDegerle(): void {
        if (this.selectedYear && this.selectedBrandId) {
            // URL Parametreleri ile /wizard sayfasına yönlendirme
            this._router.navigate(['/wizard'], {
                queryParams: {
                    year: this.selectedYear,
                    brandId: this.selectedBrandId
                }
            });
        } else {
            // Kullanıcıya bir uyarı gösterebilir veya varsayılan bir aksiyon alabilirsiniz
            console.log('Lütfen Model Yılı ve Marka Seçiniz.');
        }
    }
}
