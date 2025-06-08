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
        this._colDownSubscription = this._eventAggregator.subscribe('hover-colDown', x => {
            this.direction = 'down';
            this.hover = x == this.x;
        });
        this._colUpSubscription = this._eventAggregator.subscribe('hover-colUp', x => {
            this.direction = 'up';
            this.hover = x == this.x;
        });
        this._rowRightSubscription = this._eventAggregator.subscribe('hover-rowRight', y => {
            this.direction = 'right';
            this.hover = y == this.y;
        });
        this._rowLeftSubscription = this._eventAggregator.subscribe('hover-rowLeft', y => {
            this.direction = 'left';
            this.hover = y == this.y;
        });
        this._unhoverSubscription = this._eventAggregator.subscribe('unhover', _ => this.hover = false);
    }

    detached() {
        this._colDownSubscription.dispose();
        this._colUpSubscription.dispose();
        this._rowRightSubscription.dispose();
        this._rowLeftSubscription.dispose();
    }

    push() {
        this._eventAggregator.publish('push', this.tile);
        this.unHover()
    }

    doHover() {
        if (this.x > 0 && this.x < this.maxPosition && this.y > 0 && this.y < this.maxPosition) return;
        this.hover = true;
        if (this.y == 0) this._eventAggregator.publish('hover-colDown', this.x);
        if (this.y == this.maxPosition) this._eventAggregator.publish('hover-colUp', this.x);
        if (this.x == 0) this._eventAggregator.publish('hover-rowRight', this.y);
        if (this.x == this.maxPosition) this._eventAggregator.publish('hover-rowLeft', this.y);
    }

    unHover() {
        this.hover = false;
        this._eventAggregator.publish('unhover', this.x);
    }
}
