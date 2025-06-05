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
            id: 'tile_' + y + '-' + x,
            color: 'transparent',
            value: 1
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
            // this._highestValue = this.board[2][2].value;
            // this._eventAggregator.publish('high', this._highestValue);
            this._eventAggregator.publish('moves', { moves: this._moves });
        }
        this._addListeners();
    }

    detached() {
        this._removeListeners();
    }

    _saveSettings() {
        this.settings.board = this.board;
        this.settings.gameEnd = this._gameEnd;
        this.settings.moves = this._moves;
        this._settingService.saveSettings(this.settings);
    }

    _addListeners() {
        this._moveListener = this._eventAggregator.subscribe('request-move', move => {
            this._currentTile = this.board[move.tile.y][move.tile.x];
            this._moveIfValid(move); // x,y,directions[y,x]
        });
        this.restartListener = this._eventAggregator.subscribe('restart', () => {
            this.maxColors = 2;
            this._restartGame();
        });
    }

    _removeListeners() {
        this.restartListener.dispose();
    }

    _restartGame() {
        this._newBoard();
        this._saveSettings();
    }

    _moveIfValid(move) {
        let target = [move.tile.y + move.directions[0], move.tile.x + move.directions[1]]; // coords
        let targetTile = this.board[target[0]][target[1]];
        if (move.tile.color == targetTile.color) {
            // animate the dragged tile to the target
            move.animate = true;
            this._eventAggregator.publish('move', move);
            this._moves++;
            this._eventAggregator.publish('moves', { moves: this._moves });
            let tilesBehind = this._findTilesBehind(move);
            // wait for animation to target
            setTimeout(() => {
                this._eventAggregator.publish('correct', targetTile);
                this._restoreTilePositions(tilesBehind, move.directions);
                this._shiftColors(tilesBehind, move.directions);

                // animate the intruding tiles on the board
                let time = this._animateTiles(tilesBehind, move.directions);
                setTimeout(() => {
                    tilesBehind.unshift(targetTile);
                    this._eventAggregator.publish('unlockTiles');
                    this._saveSettings();
                    this._checkGameEnd();
                }, time);
            }, 100);
        } else {
            this._eventAggregator.publish('reset', move);
            this._eventAggregator.publish('unlockTiles');
        }
    }

    _restoreTilePositions(tiles, directions) {

        let oppositeDirections = [-directions[0], -directions[1]];

        // shift the tiles 1 place in opposite direction as moved tile 
        for (let i = 0; i < tiles.length; i++) {
            let vector = {
                tile: tiles[i],
                directions: oppositeDirections,
                animate: false
            };
            this._eventAggregator.publish('move', vector);
        }
    }

    _shiftColors(tiles, directions) {
        // shift values of tiles one place in same direction as moved tile
        let last = tiles.length - 1;
        for (let i = 0; i < last; i++) {
            const current = this.board[tiles[i].y][tiles[i].x];
            const previous = this.board[tiles[i].y - directions[0]][tiles[i].x - directions[1]];
            current.color = previous.color;
            current.className = previous.className;
        }

        // fill the new outermost tile
        const newTile = this.board[tiles[last].y][tiles[last].x]
        newTile.setRandomColor(newTile._maxColors);
    }

    _animateTiles(tiles, directions) {
        const ddt = 100;
        let dt = 100;
        if (tiles.length) {
            // the first [0] tile is the dragged one
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                let vector = {
                    tile: tile,
                    directions: [0, 0],
                    animate: true
                };
                setTimeout(() => {
                    this._eventAggregator.publish('move', vector);
                }, dt);
                dt += ddt;
            }
        }
        return dt;
    }

    // find the tiles behind the moved tile from the empty place to the wall
    _findTilesBehind(move) {
        let tilesBehind = [];
        let t = [move.tile.y, move.tile.x];
        // if one of the directions > 0 then step = -1 (opposite direction)
        let step = move.directions.some(v => { return v > 0; }) ? -1 : 1;
        let max = (step > 0) ? this.rowTileCount : -1;
        let start = (move.directions[0] == 0) ? t[1] : t[0];
        for (let i = start; i != max; i += step) {
            tilesBehind.push(this.board[t[0]][t[1]]);
            t = t.map((pos, j) => { return pos - move.directions[j]; });
        }
        return tilesBehind;
    }

    _movesHorPossible() {
        let equals = false;
        this.board.forEach(row => {
            row.forEach((tile, x) => {
                const nextTile = row[x + 1];
                if (nextTile) {
                    equals = equals || nextTile.color == tile.color;
                }
            });
        });
        return equals;
    }

    _movesVerPossible() {
        let equals = false;
        this.board[0].forEach((tile, x) => {
            this.board.forEach((row, y) => {
                const current = row[x].color;
                const nextRow = this.board[y + 1];
                if (nextRow) {
                    const next = nextRow[x].color;
                    equals = equals || next == current;
                }
            });
        });
        return equals;
    }

    _allEqual() {
        const firstColor = this.board[0][0].color;
        const notAllEqual = this.board.some(row => row.some(tile => tile.color != firstColor));
        return !notAllEqual;
    }

    _checkGameEnd() {
        // wait for animation of intruding tiles
        if (this._allEqual()) {
            this._winGame();
        } else if (!this._movesHorPossible() && !this._movesVerPossible()) {
            this.settings.gameEnd = true;
            this._saveSettings();
            this._endGame();
        }
    }

    _winGame() {
        this.win = true;
        setTimeout(_ => {
            this.win = false;
            if (this.maxColors < 4)
                this.maxColors++;
            setTimeout(_ => {
                this._restartGame();
                this._eventAggregator.publish('win', this.maxColors);
            }, 500);
        }, 500);
    }

    _endGame() {
        this._gameEnd = true;
        this._eventAggregator.publish('burn');
        this.board.forEach(row => {
            row.forEach(tile => {
                setTimeout(_ => {
                    this._eventAggregator.publish('onfire', tile);
                }, Math.random() * 1500);
            });
        });
    }

}
