import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'resources/services/my-settings-service';

@inject(Element, EventAggregator, MySettingsService)
export class BoardCustomElement {
    maxColors = 2;
    win = false;

    settings = {
        version: 'v1.1', // increase if board structure changes
    }

    constructor(element, eventAggregator, mySettingsService) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this._settingService = mySettingsService;
        this._highestValue = 1;
        this._score = 0;
        this.rowTileCount = 5; // tiles in one row
        this.center = Math.floor(this.rowTileCount / 2);
        this.board = [];
        this.showBoard = true;
        this._newValues = [1];
        this._gameEnd = false;
    }

    attached() {
        this.boardSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--boardSize'));
        this._tileSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--tileSize'));
        this.center = Math.floor(this.boardSize / 2);
        this.offset = this.boardSize * 2 / (this.boardSize + 1);
        this.distance = this._tileSize + this.offset;
    }

    _newTile(x, y) {
        const tile = {
            x: x,
            y: y,
            dx: 0,
            dy: 0,
            id: 'tile_' + y + '-' + x,
            color: 'transparent',
        };
        return tile;
    }

    _newBoard() {
        this._highestValue = 1;
        this._newValues = [1];
        this._score = 0;
        this._moves = 0;
        this._gameEnd = false;
        this.showBoard = false;
        this.board = [];

        for (let y = 0; y < this.rowTileCount; y++) {
            let row = [];
            for (let x = 0; x < this.rowTileCount; x++) {
                row.push(this._newTile(x, y));
            }
            this.board.push(row);
        }
        setTimeout(() => {
            this.showBoard = true;
        }, 200);

        this._eventAggregator.publish('reset-score');
        this._eventAggregator.publish('moves', { moves: this._moves });
    }

    attached() {
        const settings = this._settingService.getSettings();
        if (!settings.board || settings.gameEnd) {
            this._newBoard();
            this._saveSettings();
        } else {
            this.board = settings.board;
            this._moves = settings.moves || 0;
            this._eventAggregator.publish('moves', { moves: this._moves });
        }
        this._pushSubscription = this._eventAggregator.subscribe('push', tile => this._push(tile));
    }

    _push(tile) {
        console.log('tile', tile);
        switch (true) {
            case tile.x == 0:
                this._pushRow(tile.y, 1);
                break;
            case tile.x == this.rowTileCount:
                this._pushRow(tile.y, -1);
                break;
            case tile.y == 0:
                this._pushColumn(tile.x, 1);
                break;
            case tile.y == this.rowTileCount:
                this._pushColumn(tile.x, -1);
                break;
        }
    }

    _pushRow(y, direction) {
        for (let x = 0; x < this.rowTileCount; x++) 
            this.board[y][x].dx += direction;
        this._moves++;
        this._eventAggregator.publish('moves', { moves: this._moves });
        this._saveSettings();
    }

    _pushColumn(x, direction) {
        for (let y = 0; y < this.rowTileCount; y++) 
            this.board[y][x].dy += direction;
        this._moves++;
        this._eventAggregator.publish('moves', { moves: this._moves });
        this._saveSettings();
    }

    detached() {
        this._pushSubscription.dispose();
    }

    _saveSettings() {
        this.settings.board = this.board;
        this.settings.gameEnd = this._gameEnd;
        this.settings.moves = this._moves;
        this._settingService.saveSettings(this.settings);
    }

    _restartGame() {
        this._newBoard();
        this._saveSettings();
    }

}
