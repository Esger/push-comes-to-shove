import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'resources/services/my-settings-service';

@inject(Element, EventAggregator, MySettingsService)
export class BoardCustomElement {
    @bindable rowTileCount;
    win = false;

    constructor(element, eventAggregator, mySettingsService) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this._settingService = mySettingsService;
        this.board = [];
        this.showBoard = true;
    }

    attached() {
        const settings = this._settingService.getSettings();
        this._moves = 0;
        this._level = settings.level || 1;
        this._eventAggregator.publish('moves', { moves: this._moves });
        this._pushSubscription = this._eventAggregator.subscribe('push', tile => {
            this._push(tile);
            this._checkWin();
            this._moves++;
            this._eventAggregator.publish('moves', { moves: this._moves });
        });
        this._undoSubscription = this._eventAggregator.subscribe('undo', _ => {
            if (!this._undoStack.length) return;
            this._undo();
            this._moves--;
            this._eventAggregator.publish('moves', { moves: this._moves });
        });
    }

    detached() {
        this._pushSubscription.dispose();
        this._undoSubscription.dispose();
    }

    rowTileCountChanged(newValue) {
        this.maxPosition = newValue - 1;
        this._newBoard();
    }

    _newTile(x, y) {
        const tile = {
            x: x,
            y: y,
            id: 'tile_' + y * (this.maxPosition) + x,
            color: 2,
        };
        return tile;
    }

    _newBoard() {
        this.win = false;
        this._moves = 0;
        this.showBoard = false;
        this.board = [];
        this._undoStack = [];

        for (let y = 0; y < this.maxPosition; y++)
            for (let x = 0; x < this.maxPosition; x++)
                this.board.push(this._newTile(x, y));
        this.board.shift();

        const minEqualTileCount = Math.pow((this.rowTileCount - 2), 2);
        while (this.board.filter(tile => tile.color == 1).length < minEqualTileCount)
            this.board[Math.floor(Math.random() * this.board.length)].color = 1;

        setTimeout(_ => this.showBoard = true, 200);

        this._eventAggregator.publish('moves', { moves: this._moves });
    }

    _checkWin() {
        const boardTiles = this.board.filter(tile => tile.x > 0 && tile.x < this.maxPosition && tile.y > 0 && tile.y < this.maxPosition);
        if (boardTiles.some(tile => tile.color !== boardTiles[0].color)) return;

        this.win = true;
        setTimeout(_ => {
            this._level += 1;
            this._saveSettings();
            this._eventAggregator.publish('win', this._level);
        }, 1500);
    }

    _push(tile) {
        switch (true) {
            case tile.x == 0:
                this._pushRow(tile.y, 1);
                this._undoStack.push(['row', tile.y, -1]);
                break;
            case tile.x == this.maxPosition:
                this._pushRow(tile.y, -1);
                this._undoStack.push(['row', tile.y, 1]);
                break;
            case tile.y == 0:
                this._pushColumn(tile.x, 1);
                this._undoStack.push(['col', tile.x, -1]);
                break;
            case tile.y == this.maxPosition:
                this._pushColumn(tile.x, -1);
                this._undoStack.push(['col', tile.x, 1]);
                break;
        }
    }

    _undo() {
        const action = this._undoStack.pop();
        switch (action[0]) {
            case 'row':
                this._pushRow(action[1], action[2]);
                break;
            case 'col':
                this._pushColumn(action[1], action[2]);
                break;
        }
    }

    _pushRow(y, direction) {
        const row = this.board.filter(tile => tile.y == y);
        row.forEach(tile => tile.x += direction);
    }

    _pushColumn(x, direction) {
        const column = this.board.filter(tile => tile.x == x);
        column.forEach(tile => tile.y += direction);
    }

    _saveSettings() {
        const settings = this._settingService.getSettings();
        settings.level = this._level;
        this._settingService.saveSettings(settings);
    }

}
