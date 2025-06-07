import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'resources/services/my-settings-service';

@inject(EventAggregator, MySettingsService)
export class GameCustomElement {
    title = 'Push Comes to Shove';
    FIRSTROWTILECOUNT = 4;

    constructor(eventAggregator, settingsService) {
        this._eventAggregator = eventAggregator;
        this._settingService = settingsService;
        this.level = this._settingService.getSettings().level || 1;
        this.rowTileCount = this.FIRSTROWTILECOUNT + (this.level - 1);
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
    }
    
    restart() {
        this.level = 1;
        this.rowTileCount = this.FIRSTROWTILECOUNT;
        document.body.style = '--rowTileCount: ' + this.rowTileCount;
        this.levelClass = 'level--0';
        const settings = this._settingService.getSettings();
        settings.level = this.level;
        this._settingService.saveSettings(settings);
        this._eventAggregator.publish('restart');
    }

    undo() {
        this._eventAggregator.publish('undo');
    }

    detached() {
        this._moveSubscription.dispose();
        this._winSubscription.dispose();
        this._restartSubscription.dispose();
    }

}
