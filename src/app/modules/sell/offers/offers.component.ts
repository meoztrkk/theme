import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  id!: number;

  // Özet (wizard’dan kaydedilen kaydın kısa bilgileri)
  summary: any = null;

  // Mock teklifler (şimdilik wizard’dakini kopyaladık)
  offers = [
    { name: 'VavaCars', price: 655000, appointment: '31 Eki 05:58', location: 'Kadıköy',  logo: '/images/apps/sell/vavacars.jpg' },
    { name: 'Otoplus',  price: 637000, appointment: '30 Eki 12:58', location: 'Maslak',  logo: '/images/apps/sell/otoplus.png' },
    { name: 'OtoBid',   price: 640000, appointment: '30 Eki 12:58', location: 'Üsküdar', logo: '/images/apps/sell/otobid.png' },
  ];

  constructor(private route: ActivatedRoute/*, private wiz: SellWizardService*/) {}

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
}
