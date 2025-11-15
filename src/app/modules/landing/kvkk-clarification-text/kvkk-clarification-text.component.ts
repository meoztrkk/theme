import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'landing-kvkk-clarification-text',
    templateUrl: './kvkk-clarification-text.component.html',
    styleUrls: ['./kvkk-clarification-text.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, RouterLink],
})
export class KvkkClarificationTextComponent {
    /**
     * Constructor
     */
    constructor() {}
}

