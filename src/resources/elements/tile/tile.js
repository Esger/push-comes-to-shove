import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class TileCustomElement {
    @bindable tile;
    @bindable maxPosition;
    @bindable maxColors;
    @bindable win;

    constructor(element, eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._element = element;
    }

    attached() {
        this._setRandomColor();
        this.tile.maxColors = this.maxColors;
        this._$tile = $('#' + this.tile.id);
    }

    push() {
        this._eventAggregator.publish('push', this.tile);
    }

    _setRandomColor = (maxColors = 2) => {
        this.tile.color = Math.ceil(Math.random() * maxColors);
    }

}
