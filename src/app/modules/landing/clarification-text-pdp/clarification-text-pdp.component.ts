import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'landing-clarification-text-pdp',
    templateUrl: './clarification-text-pdp.component.html',
    styleUrls: ['./clarification-text-pdp.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, RouterLink],
})
export class ClarificationTextPdpComponent {
    /**
     * Constructor
     */
    constructor() {}
}

