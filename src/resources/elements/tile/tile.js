import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class TileCustomElement {
    @bindable x = undefined;
    @bindable y = undefined;
    @bindable tile;
    @bindable maxPosition = undefined;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }
    
    attached() {
        this.hover = false;
    }

    push() {
        this._eventAggregator.publish('push', this.tile);
        this.unHover()
    }

    doHover() {
        this.hover = true;

        // if (this.isDisabled) return;
        // this.unhover();
        // if (this.y == 0) {
        //     $(`.tile.x_${this.x}`).addClass('hover down');
        // };
        // if (this.y == this.maxPosition) {
        //     $(`.tile.x_${this.x}`).addClass('hover up');
        // };
        // if (this.x == 0) {
        //     $(`.tile.y_${this.y}`).addClass('hover right');
        // };
        // if (this.x == this.maxPosition) {
        //     $(`.tile.y_${this.y}`).addClass('hover left');
        // };
    }

    unHover() {
        this.hover = false;
    }
}
