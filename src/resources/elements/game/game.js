import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ScoreService } from 'resources/services/score-service';

@inject(ScoreService, EventAggregator)
export class GameCustomElement {
    title = 'Push Comes to Shove';
    level = 1;
    rowTileCount = 5;

    constructor(scoreService, eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._scoreService = scoreService;
    }

    attached() {
        document.body.style ='--rowTileCount: ' + this.rowTileCount;
        this.highScore = this._scoreService.getScore();
        this._highSubscription = this._eventAggregator.subscribe('high', value => {
            if (value > this.highScore) {
                this.highScore = value;
                this._scoreService.saveScore(value);
            }
            this.title = value + '+' + value;
        });
        this._moveSubscription = this._eventAggregator.subscribe('moves', moves => {
            this.moves = moves.moves;
        })
        this._winSubscription = this._eventAggregator.subscribe('win', level => {
            this.level = level - 1;
            this.levelClass = 'level--' + (level - 1);
        });
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => {
            this.level = 1;
            this.levelClass = 'level--0';
        });
    }

    restart() {
        this._eventAggregator.publish('restart');
    }

    detached() {
        this._highSubscription.dispose();
        this._moveSubscription.dispose();
        this._winSubscription.dispose();
        this._restartSubscription.dispose();
    }

}
