import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class TileCustomElement {
    @bindable tile;
    @bindable rowTileCount;
    @bindable maxColors;
    @bindable win;

    constructor(element, eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._element = element;
        this.correct = false;
        this.dx = 0;
        this.dy = 0;
    }

    attached() {
        this._setRandomColor();
        this.tile.maxColors = this.maxColors;
        this.tile.setRandomColor = this._setRandomColor;
    }

    push() {
        this._eventAggregator.publish('push', this.tile);
    }

    _setRandomColor = (maxColors = 2) => {
        this.tile.color = Math.ceil(Math.random() * maxColors);
    }

}
