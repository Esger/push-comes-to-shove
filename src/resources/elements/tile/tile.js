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

    push() {
        this._eventAggregator.publish('push', this.tile);
    }

}
