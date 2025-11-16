import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent, AppointmentDialogData } from '../appointment-dialog/appointment-dialog.component';
import { SellWizardService } from 'app/core/services/sell-wizard.service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  id!: number;

  // Özet (wizard'dan kaydedilen kaydın kısa bilgileri)
  summary: any = null;

  // Mock teklifler (şimdilik wizard'dakini kopyaladık)
  offers = [
    { id: 1, name: 'VavaCars', price: 655000, appointment: '31 Eki 05:58', location: 'Kadıköy',  logo: '/images/apps/sell/vavacars.jpg' },
    { id: 2, name: 'Otoplus',  price: 637000, appointment: '30 Eki 12:58', location: 'Maslak',  logo: '/images/apps/sell/otoplus.png' },
    { id: 3, name: 'OtoBid',   price: 640000, appointment: '30 Eki 12:58', location: 'Üsküdar', logo: '/images/apps/sell/otobid.png' },
  ];

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private wiz: SellWizardService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    // Get sell request and fetch names for IDs
    this.wiz.getSellRequest(this.id).pipe(
      switchMap((request: any) => {
        // Fetch all lookup data in parallel
        const lookups$ = forkJoin({
          brands: this.wiz.getBrands(),
          models: request.modelId && request.markaId ? this.wiz.getModels(request.markaId) : of([]),
          trims: request.varyantId && request.modelId ? this.wiz.getTrims(request.modelId) : of([]),
          colors: this.wiz.getColors(),
          cities: this.wiz.getCities()
        });

        return lookups$.pipe(
          map((lookups) => {
            // Map the request data to summary format with names
            const brand = lookups.brands.find((b: any) => Number(b.id) === request.markaId);
            const model = lookups.models.find((m: any) => Number(m.id) === request.modelId);
            const trim = lookups.trims.find((t: any) => Number(t.id) === request.varyantId);
            const color = lookups.colors.find((c: any) => Number(c.id) === request.renkId);
            const city = lookups.cities.find((c: any) => Number(c.id) === request.ilId);

            return {
              year: request.year,
              brandName: brand?.name || '',
              modelName: model?.name || '',
              trimName: trim?.name || '',
              colorName: color?.name || '',
              kilometer: request.kilometre,
              cityName: city?.name || '',
              plate: request.plaka || ''
            };
          })
        );
      })
    ).subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (err) => {
        console.error('Error loading sell request:', err);
        // Fallback to empty summary on error
        this.summary = {
          year: null,
          brandName: '',
          modelName: '',
          trimName: '',
          colorName: '',
          kilometer: null,
          cityName: '',
          plate: ''
        };
      }
    });
  }

  openAppointmentDialog(offer: any): void {
    const dialogData: AppointmentDialogData = {
      offerId: offer.id,
      offerName: offer.name,
      location: offer.location,
      price: offer.price,
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
        // Randevu başarıyla alındı
        console.log('Randevu alındı:', result.data);
        // TODO: Başarı mesajı göster (snackbar, toast vb.)
        // TODO: Backend'e randevu kaydı gönder
      } else {
        // Dialog iptal edildi veya kapatıldı
        console.log('Randevu iptal edildi');
      }
    });
  }
}
