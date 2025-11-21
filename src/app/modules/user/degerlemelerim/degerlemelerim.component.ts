import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { SellWizardService, IdNameDto } from 'app/core/services/sell-wizard.service';
import { AppointmentDialogComponent, AppointmentDialogData } from 'app/modules/sell/appointment-dialog/appointment-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

interface Valuation {
    id: number;
    year?: number;
    brandId?: number;
    modelId?: number;
    variantId?: number;
    transmissionTypeId?: number;
    fuelTypeId?: number;
    plate?: string;
    kilometer?: number;
    durumId: number;
    creationTime: Date;
    brandName?: string;
    modelName?: string;
    variantName?: string;
    transmissionName?: string;
    fuelName?: string;
    isExpired: boolean;
    isValid: boolean;
    validUntil: Date;
    priceRange?: { min: number; max: number };
    hasAppointment?: boolean;
    appointmentId?: number;
}

@Component({
    selector: 'app-degerlemelerim',
    templateUrl: './degerlemelerim.component.html',
    styleUrls: ['./degerlemelerim.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
    ],
})
export class DegerlemelerimComponent implements OnInit {
    valuations: Valuation[] = [];
    loading = true;
    userId: string | null = null;

    constructor(
        private wizardService: SellWizardService,
        private authService: AuthService,
        public router: Router,
        private dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadValuations();
    }

    loadValuations(): void {
        this.loading = true;

        // Get current user ID
        this.authService.me().pipe(
            switchMap((userData: any) => {
                if (!userData?.id) {
                    throw new Error('User not authenticated');
                }
                this.userId = userData.id;
                return this.wizardService.getUserValuations(userData.id);
            }),
            switchMap((response: any) => {
                // Handle PagedResultDto structure
                const items = response?.items || (Array.isArray(response) ? response : []);
                if (items.length === 0) {
                    this.valuations = [];
                    this.loading = false;
                    return of([]);
                }

                // Fetch all lookup data in parallel
                return forkJoin({
                    brands: this.wizardService.getBrands().pipe(catchError(() => of([]))),
                    models: this.fetchAllModels(items),
                    variants: this.fetchAllVariants(items),
                    transmissions: this.wizardService.getTransmissions().pipe(catchError(() => of([]))),
                    fuels: this.wizardService.getFuels().pipe(catchError(() => of([]))),
                }).pipe(
                    map((lookups) => {
                        return items.map((item: any) => {
                            const brand = lookups.brands.find((b: IdNameDto) => b.id === item.markaId);
                            const model = lookups.models.find((m: IdNameDto) => m.id === item.modelId);
                            const variant = lookups.variants.find((v: IdNameDto) => v.id === item.varyantId);
                            const transmission = lookups.transmissions.find((t: IdNameDto) => t.id === item.sanzimanTipiId);
                            const fuel = lookups.fuels.find((f: IdNameDto) => f.id === item.yakitTuruId);

                            const creationTime = new Date(item.creationTime);
                            const daysSinceCreation = Math.floor((Date.now() - creationTime.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = daysSinceCreation > 30 || item.durumId === 14; // 30 days or status 14 (invalid)

                            // Valid if created within last 3 days and not invalid status
                            const isValid = daysSinceCreation < 1 && item.durumId !== 14;

                            // Valid until date (creationTime + 3 days)
                            const validUntil = new Date(creationTime);
                            validUntil.setDate(validUntil.getDate() + 1);

                            // Generate random price range for valid valuations (e.g., 789.000 - 830.000₺)
                            let priceRange: { min: number; max: number } | undefined;
                            if (isValid) {
                                const basePrice = 500000 + Math.random() * 500000; // Random base between 500k-1M
                                const range = 50000; // 50k range
                                priceRange = {
                                    min: Math.floor(basePrice / 1000) * 1000,
                                    max: Math.floor((basePrice + range) / 1000) * 1000,
                                };
                            }

                            return {
                                id: item.id,
                                year: item.year,
                                brandId: item.markaId,
                                modelId: item.modelId,
                                variantId: item.varyantId,
                                transmissionTypeId: item.sanzimanTipiId,
                                fuelTypeId: item.yakitTuruId,
                                plate: item.plaka,
                                kilometer: item.kilometre,
                                durumId: item.durumId,
                                creationTime,
                                brandName: brand?.name || '',
                                modelName: model?.name || '',
                                variantName: variant?.name || '',
                                transmissionName: transmission?.name || '',
                                fuelName: fuel?.name || '',
                                isExpired,
                                isValid,
                                validUntil,
                                priceRange,
                            } as Valuation;
                        });
                    })
                );
            })
        ).subscribe({
            next: (valuations) => {
                // Randevu kontrolü yap
                this.checkAppointmentsForValuations(valuations);
                this.valuations = valuations;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading valuations:', err);
                this.loading = false;
            },
        });
    }

    private fetchAllModels(items: any[]): Observable<IdNameDto[]> {
        const uniqueBrandIds = [...new Set(items.map((i: any) => i.markaId).filter((id: any) => id))];
        if (uniqueBrandIds.length === 0) {
            return of([]);
        }

        const modelRequests = uniqueBrandIds.map((brandId: number) =>
            this.wizardService.getModels(brandId).pipe(catchError(() => of([])))
        );

        return forkJoin(modelRequests).pipe(
            map((results) => results.flat())
        );
    }

    private fetchAllVariants(items: any[]): Observable<IdNameDto[]> {
        const uniqueModelIds = [...new Set(items.map((i: any) => i.modelId).filter((id: any) => id))];
        if (uniqueModelIds.length === 0) {
            return of([]);
        }

        const variantRequests = uniqueModelIds.map((modelId: number) =>
            this.wizardService.getTrims(modelId).pipe(catchError(() => of([])))
        );

        return forkJoin(variantRequests).pipe(
            map((results) => results.flat())
        );
    }

    getCarDisplayName(valuation: Valuation): string {
        const parts: string[] = [];
        if (valuation.brandName) parts.push(valuation.brandName);
        if (valuation.modelName) parts.push(valuation.modelName);
        if (valuation.variantName) parts.push(valuation.variantName);
        return parts.join(' ') || 'Araç';
    }

    getCarSpecs(valuation: Valuation): string {
        const specs: string[] = [];
        if (valuation.year) specs.push(valuation.year.toString());
        if (valuation.kilometer) specs.push(`${valuation.kilometer.toLocaleString('tr-TR')} km`);
        if (valuation.transmissionName) specs.push(valuation.transmissionName);
        if (valuation.fuelName) specs.push(valuation.fuelName);
        if (valuation.plate) specs.push(valuation.plate);
        return specs.join(' • ');
    }

    reEvaluate(valuation: Valuation): void {
        // Navigate to wizard - pre-filling can be implemented later
        this.router.navigate(['/wizard']);
    }

    removeValuation(valuation: Valuation): void {
        const carName = this.getCarDisplayName(valuation);

        const confirmation = this._fuseConfirmationService.open({
            title: 'Değerlemeyi Kaldır',
            message: `"${carName}" aracına ait değerlemeyi kalıcı olarak kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
            actions: {
                confirm: { label: 'Kaldır', color: 'warn' },
                cancel: { label: 'İptal' },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.wizardService.deleteValuation(valuation.id).subscribe({
                    next: () => {
                        this._snackBar.open('Değerleme başarıyla kaldırıldı.', 'Kapat', {
                            duration: 3000,
                            panelClass: ['bg-green-600']
                        });
                        this.loadValuations();
                    },
                    error: (err) => {
                        console.error('Error deleting valuation:', err);
                        this._snackBar.open(
                            'Değerleme kaldırılırken bir hata oluştu: ' + (err.error?.message || 'Bilinmeyen hata.'),
                            'Kapat',
                            { duration: 5000 }
                        );
                    },
                });
            }
        });
    }

    openAppointmentDialog(valuation: Valuation): void {
        if (!valuation.priceRange) {
            return;
        }

        // Eğer bu değerleme için zaten randevu varsa uyarı göster
        if (valuation.hasAppointment) {
            this._snackBar.open(
                'Bu değerleme için zaten bir randevunuz bulunmaktadır. Randevularım sayfasından görüntüleyebilir veya güncelleyebilirsiniz.',
                'Randevularım\'a Git',
                {
                    duration: 5000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                }
            ).onAction().subscribe(() => {
                this.router.navigate(['/randevularim']);
            });
            return;
        }

        const carName = this.getCarDisplayName(valuation);
        const averagePrice = Math.floor((valuation.priceRange.min + valuation.priceRange.max) / 2);

        const dialogData: AppointmentDialogData = {
            offerId: valuation.id,
            offerName: carName,
            location: 'İstanbul', // Default location, can be enhanced later
            price: averagePrice,
        };

        const dialogRef = this.dialog.open(AppointmentDialogComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: dialogData,
            panelClass: 'appointment-dialog',
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.success) {
                // Randevu başarıyla alındı, değerlemeleri yeniden yükle
                this._snackBar.open('Randevu başarıyla alındı', 'Kapat', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                });
                this.loadValuations(); // Randevu durumunu güncellemek için yeniden yükle
            }
        });
    }

    formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    formatPriceRange(priceRange: { min: number; max: number }): string {
        return `${priceRange.min.toLocaleString('tr-TR')} - ${priceRange.max.toLocaleString('tr-TR')}₺`;
    }

    private getAppointmentsStorageKey(): string {
        const token = this.authService.accessToken;
        if (!token) {
            return 'appointments_anonymous';
        }
        const userId = AuthUtils.getUserIdFromToken(token);
        return userId ? `appointments_${userId}` : 'appointments_anonymous';
    }

    private checkAppointmentsForValuations(valuations: Valuation[]): void {
        // localStorage'dan randevuları oku (kullanıcı bazlı)
        const storageKey = this.getAppointmentsStorageKey();
        const savedAppointments = localStorage.getItem(storageKey);
        if (!savedAppointments) {
            return;
        }

        try {
            const appointments = JSON.parse(savedAppointments);

            // Her değerleme için randevu kontrolü yap
            valuations.forEach((valuation) => {
                const appointment = appointments.find((apt: any) => apt.offerId === valuation.id);
                if (appointment) {
                    valuation.hasAppointment = true;
                    valuation.appointmentId = appointment.id;
                } else {
                    valuation.hasAppointment = false;
                    valuation.appointmentId = undefined;
                }
            });
        } catch (e) {
            console.error('Error checking appointments:', e);
        }
    }

    hasAppointment(valuation: Valuation): boolean {
        return valuation.hasAppointment === true;
    }
}

