import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class GameCustomElement {
    title = 'Push Comes to Shove';
    level = 1;
    rowTileCount = 5;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }

    attached() {
        document.body.style ='--rowTileCount: ' + this.rowTileCount;
        this._moveSubscription = this._eventAggregator.subscribe('moves', moves => {
            this.moves = moves.moves;
        })
        this._winSubscription = this._eventAggregator.subscribe('win', level => {
            this.level = level;
            this.rowTileCount++;
            document.body.style = '--rowTileCount: ' + this.rowTileCount;
            this.levelClass = 'level--' + (level - 1);
        });
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => {
            this.level = 1;
            this.rowTileCount = 5;
            document.body.style = '--rowTileCount: ' + this.rowTileCount;
            this.levelClass = 'level--0';
        });
    }

    restart() {
        this._eventAggregator.publish('restart');
    }

    detached() {
        this._moveSubscription.dispose();
        this._winSubscription.dispose();
        this._restartSubscription.dispose();
    }

}
