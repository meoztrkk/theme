import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent, AppointmentDialogData } from '../appointment-dialog/appointment-dialog.component';

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
    private dialog: MatDialog
    /*, private wiz: SellWizardService*/
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    // this.wiz.getSellRequest(this.id).subscribe(x => this.summary = x);
    // Şimdilik mock özet:
    this.summary = {
      year: 2018, brandName: 'Fiat', modelName: 'Egea',
      trimName: 'Urban', colorName: 'Beyaz', kilometer: 78000,
      cityName: 'İstanbul', plate: '34ABC123'
    };
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
