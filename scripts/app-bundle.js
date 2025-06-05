define('app',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  //Configure Bluebird Promises.
  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    //config.globalResources([]);
  }
});
define('resources/value-converters/id-value-converter',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var idValueConverter = exports.idValueConverter = function () {
        function idValueConverter() {
            _classCallCheck(this, idValueConverter);
        }

        idValueConverter.prototype.toView = function toView(id, params) {
            id = 'tile_' + params.y + '-' + params.x;
            return id;
        };

        return idValueConverter;
    }();
});
define('resources/value-converters/tile-value-converter',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var tileValueConverter = exports.tileValueConverter = function () {
        function tileValueConverter() {
            _classCallCheck(this, tileValueConverter);
        }

        tileValueConverter.prototype.toView = function toView(value, params) {
            value = params.board[params.y][params.x];
            return value;
        };

        return tileValueConverter;
    }();
});
define('resources/services/drag-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DragService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var DragService = exports.DragService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function DragService(eventAggregator) {
            _classCallCheck(this, DragService);

            this._eventAggregator = eventAggregator;
            this._dragStartPos = undefined;
            this._dragEndPos = undefined;
            this._lastZindex = 1;
            this._dragged = false;
        }

        DragService.prototype.getClientPos = function getClientPos(event) {
            var clientX = event.touches ? event.touches[0].clientX : event.clientX;
            var clientY = event.touches ? event.touches[0].clientY : event.clientY;
            return {
                left: clientX,
                top: clientY
            };
        };

        DragService.prototype.startDrag = function startDrag(event) {
            if (!this._element) {
                this._element = event.target;
                this._dragStartPos = this.getClientPos(event);
                this._dragPreviousPos = this._dragStartPos;

                var element = {
                    element: this._element,
                    left: this._dragStartPos.left,
                    top: this._dragStartPos.top
                };

                this._eventAggregator.publish('startDrag', element);
            }
            return false;
        };

        DragService.prototype.doDrag = function doDrag(event) {
            if (this._element) {
                var clientPos = this.getClientPos(event);
                var dx = clientPos.left - this._dragPreviousPos.left;
                var dy = clientPos.top - this._dragPreviousPos.top;
                if (Math.abs(dx) + Math.abs(dy) > 0) {
                    this._dragPreviousPos = clientPos;

                    var element = {
                        element: this._element,
                        dx: dx,
                        dy: dy
                    };

                    this._eventAggregator.publish('doDrag', element);
                }
            }
        };

        DragService.prototype.stopDrag = function stopDrag(event) {
            if (this._element) {
                var element = {
                    element: this._element
                };

                this._eventAggregator.publish('stopDrag', element);
                this._element = undefined;
                this._dragPreviousPos = undefined;
            }
        };

        return DragService;
    }()) || _class);
});
define('resources/services/my-settings-service',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var MySettingsService = exports.MySettingsService = function () {
        // increase when settings object changes
        function MySettingsService() {
            _classCallCheck(this, MySettingsService);

            this._isMobile = sessionStorage.getItem('isMobile') == 'true';
            this._settingsName = 'one-color';
            this._version = 'v1.0';
            this._settings = undefined;
            this._defaultSettings = undefined;

            this._loadSettings();
        }

        MySettingsService.prototype.saveSettings = function saveSettings(settings) {
            localStorage.setItem(this._settingsName, JSON.stringify(settings));
            this._settings = settings;
        };

        MySettingsService.prototype.getSettings = function getSettings() {
            return this._settings || this._getDefaultSettings();
        };

        MySettingsService.prototype._getDefaultSettings = function _getDefaultSettings() {
            this._defaultSettings = this._defaultSettings || {
                version: this._version || 1.0
            };
            return this._defaultSettings;
        };

        MySettingsService.prototype.resetSettings = function resetSettings() {
            this._settings = this._getDefaultSettings();
            this.saveSettings(this._settings);
        };

        MySettingsService.prototype._loadSettings = function _loadSettings() {
            var settings = JSON.parse(localStorage.getItem(this._settingsName));
            if (!settings || settings.version !== this._version) this.resetSettings();else this._settings = settings;
        };

        return MySettingsService;
    }();
});
define('resources/services/score-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ScoreService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ScoreService = exports.ScoreService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function ScoreService(eventAggregator) {
            var _this = this;

            _classCallCheck(this, ScoreService);

            this.ea = eventAggregator;
            this.score = {};
            this.ea.subscribe('resetHighScore', function (response) {
                _this.resetHighScore(response);
            });
        }

        ScoreService.prototype.getScore = function getScore() {
            var score = localStorage.getItem('one-color-scores');
            if (score) {
                this.score = JSON.parse(score);
                return this.score;
            } else {
                return 1;
            }
        };

        ScoreService.prototype.saveScore = function saveScore(score) {
            if (score) {
                this.score = score;
                localStorage.setItem('one-color-scores', JSON.stringify(score));
            }
            this.ea.publish('updateStatus');
        };

        ScoreService.prototype.resetHighScore = function resetHighScore(level) {
            this.score[level] = 0;
            this.saveScore(this.score);
            this.ea.publish('updateStatus');
        };

        return ScoreService;
    }()) || _class);
});
define('resources/elements/board/board',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'resources/services/my-settings-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _mySettingsService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BoardCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var BoardCustomElement = exports.BoardCustomElement = (_dec = (0, _aureliaFramework.inject)(Element, _aureliaEventAggregator.EventAggregator, _mySettingsService.MySettingsService), _dec(_class = function () {
        function BoardCustomElement(element, eventAggregator, mySettingsService) {
            _classCallCheck(this, BoardCustomElement);

            this.maxColors = 2;
            this.win = false;
            this.settings = {
                version: 'v1.1' // increase if board structure changes
            };

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

        BoardCustomElement.prototype.attached = function attached() {
            this.boardSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--boardSize'));
            this._tileSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--tileSize'));
            this.center = Math.floor(this.boardSize / 2);
            this.offset = this.boardSize * 2 / (this.boardSize + 1);
            this.distance = this._tileSize + this.offset;
        };

        BoardCustomElement.prototype._newTile = function _newTile(x, y) {
            var tile = {
                x: x,
                y: y,
                id: 'tile_' + y + '-' + x,
                color: 'transparent',
                value: 1
            };
            return tile;
        };

        BoardCustomElement.prototype._newBoard = function _newBoard() {
            var _this = this;

            this._highestValue = 1;
            this._newValues = [1];
            this._score = 0;
            this._moves = 0;
            this._gameEnd = false;
            this.showBoard = false;
            this.board = [];

            for (var y = 0; y < this.rowTileCount; y++) {
                var row = [];
                for (var x = 0; x < this.rowTileCount; x++) {
                    row.push(this._newTile(x, y));
                }
                this.board.push(row);
            }
            setTimeout(function () {
                _this.showBoard = true;
            }, 200);

            this._eventAggregator.publish('reset-score');
            this._eventAggregator.publish('moves', { moves: this._moves });
        };

        BoardCustomElement.prototype.attached = function attached() {
            var settings = this._settingService.getSettings();
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
        };

        BoardCustomElement.prototype.detached = function detached() {
            this._removeListeners();
        };

        BoardCustomElement.prototype._saveSettings = function _saveSettings() {
            this.settings.board = this.board;
            this.settings.gameEnd = this._gameEnd;
            this.settings.moves = this._moves;
            this._settingService.saveSettings(this.settings);
        };

        BoardCustomElement.prototype._addListeners = function _addListeners() {
            var _this2 = this;

            this._moveListener = this._eventAggregator.subscribe('request-move', function (move) {
                _this2._currentTile = _this2.board[move.tile.y][move.tile.x];
                _this2._moveIfValid(move); // x,y,directions[y,x]
            });
            this.restartListener = this._eventAggregator.subscribe('restart', function () {
                _this2.maxColors = 2;
                _this2._restartGame();
            });
        };

        BoardCustomElement.prototype._removeListeners = function _removeListeners() {
            this.restartListener.dispose();
        };

        BoardCustomElement.prototype._restartGame = function _restartGame() {
            this._newBoard();
            this._saveSettings();
        };

        BoardCustomElement.prototype._moveIfValid = function _moveIfValid(move) {
            var _this3 = this;

            var target = [move.tile.y + move.directions[0], move.tile.x + move.directions[1]]; // coords
            var targetTile = this.board[target[0]][target[1]];
            if (move.tile.color == targetTile.color) {
                // animate the dragged tile to the target
                move.animate = true;
                this._eventAggregator.publish('move', move);
                this._moves++;
                this._eventAggregator.publish('moves', { moves: this._moves });
                var tilesBehind = this._findTilesBehind(move);
                // wait for animation to target
                setTimeout(function () {
                    _this3._eventAggregator.publish('correct', targetTile);
                    _this3._restoreTilePositions(tilesBehind, move.directions);
                    _this3._shiftColors(tilesBehind, move.directions);

                    // animate the intruding tiles on the board
                    var time = _this3._animateTiles(tilesBehind, move.directions);
                    setTimeout(function () {
                        tilesBehind.unshift(targetTile);
                        _this3._eventAggregator.publish('unlockTiles');
                        _this3._saveSettings();
                        _this3._checkGameEnd();
                    }, time);
                }, 100);
            } else {
                this._eventAggregator.publish('reset', move);
                this._eventAggregator.publish('unlockTiles');
            }
        };

        BoardCustomElement.prototype._restoreTilePositions = function _restoreTilePositions(tiles, directions) {

            var oppositeDirections = [-directions[0], -directions[1]];

            // shift the tiles 1 place in opposite direction as moved tile 
            for (var i = 0; i < tiles.length; i++) {
                var vector = {
                    tile: tiles[i],
                    directions: oppositeDirections,
                    animate: false
                };
                this._eventAggregator.publish('move', vector);
            }
        };

        BoardCustomElement.prototype._shiftColors = function _shiftColors(tiles, directions) {
            // shift values of tiles one place in same direction as moved tile
            var last = tiles.length - 1;
            for (var i = 0; i < last; i++) {
                var current = this.board[tiles[i].y][tiles[i].x];
                var previous = this.board[tiles[i].y - directions[0]][tiles[i].x - directions[1]];
                current.color = previous.color;
                current.className = previous.className;
            }

            // fill the new outermost tile
            var newTile = this.board[tiles[last].y][tiles[last].x];
            newTile.setRandomColor(newTile._maxColors);
        };

        BoardCustomElement.prototype._animateTiles = function _animateTiles(tiles, directions) {
            var _this4 = this;

            var ddt = 100;
            var dt = 100;
            if (tiles.length) {
                var _loop = function _loop(i) {
                    var tile = tiles[i];
                    var vector = {
                        tile: tile,
                        directions: [0, 0],
                        animate: true
                    };
                    setTimeout(function () {
                        _this4._eventAggregator.publish('move', vector);
                    }, dt);
                    dt += ddt;
                };

                // the first [0] tile is the dragged one
                for (var i = 0; i < tiles.length; i++) {
                    _loop(i);
                }
            }
            return dt;
        };

        // find the tiles behind the moved tile from the empty place to the wall


        BoardCustomElement.prototype._findTilesBehind = function _findTilesBehind(move) {
            var tilesBehind = [];
            var t = [move.tile.y, move.tile.x];
            // if one of the directions > 0 then step = -1 (opposite direction)
            var step = move.directions.some(function (v) {
                return v > 0;
            }) ? -1 : 1;
            var max = step > 0 ? this.rowTileCount : -1;
            var start = move.directions[0] == 0 ? t[1] : t[0];
            for (var i = start; i != max; i += step) {
                tilesBehind.push(this.board[t[0]][t[1]]);
                t = t.map(function (pos, j) {
                    return pos - move.directions[j];
                });
            }
            return tilesBehind;
        };

        BoardCustomElement.prototype._movesHorPossible = function _movesHorPossible() {
            var equals = false;
            this.board.forEach(function (row) {
                row.forEach(function (tile, x) {
                    var nextTile = row[x + 1];
                    if (nextTile) {
                        equals = equals || nextTile.color == tile.color;
                    }
                });
            });
            return equals;
        };

        BoardCustomElement.prototype._movesVerPossible = function _movesVerPossible() {
            var _this5 = this;

            var equals = false;
            this.board[0].forEach(function (tile, x) {
                _this5.board.forEach(function (row, y) {
                    var current = row[x].color;
                    var nextRow = _this5.board[y + 1];
                    if (nextRow) {
                        var next = nextRow[x].color;
                        equals = equals || next == current;
                    }
                });
            });
            return equals;
        };

        BoardCustomElement.prototype._allEqual = function _allEqual() {
            var firstColor = this.board[0][0].color;
            var notAllEqual = this.board.some(function (row) {
                return row.some(function (tile) {
                    return tile.color != firstColor;
                });
            });
            return !notAllEqual;
        };

        BoardCustomElement.prototype._checkGameEnd = function _checkGameEnd() {
            // wait for animation of intruding tiles
            if (this._allEqual()) {
                this._winGame();
            } else if (!this._movesHorPossible() && !this._movesVerPossible()) {
                this.settings.gameEnd = true;
                this._saveSettings();
                this._endGame();
            }
        };

        BoardCustomElement.prototype._winGame = function _winGame() {
            var _this6 = this;

            this.win = true;
            setTimeout(function (_) {
                _this6.win = false;
                if (_this6.maxColors < 4) _this6.maxColors++;
                setTimeout(function (_) {
                    _this6._restartGame();
                    _this6._eventAggregator.publish('win', _this6.maxColors);
                }, 500);
            }, 500);
        };

        BoardCustomElement.prototype._endGame = function _endGame() {
            var _this7 = this;

            this._gameEnd = true;
            this._eventAggregator.publish('burn');
            this.board.forEach(function (row) {
                row.forEach(function (tile) {
                    setTimeout(function (_) {
                        _this7._eventAggregator.publish('onfire', tile);
                    }, Math.random() * 1500);
                });
            });
        };

        return BoardCustomElement;
    }()) || _class);
});
define('resources/elements/game/game',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'resources/services/drag-service', 'resources/services/score-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _dragService, _scoreService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.GameCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var GameCustomElement = exports.GameCustomElement = (_dec = (0, _aureliaFramework.inject)(_dragService.DragService, _scoreService.ScoreService, _aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function GameCustomElement(dragService, scoreService, eventAggregator) {
            _classCallCheck(this, GameCustomElement);

            this.title = 'uniColor';
            this.level = 1;

            this.dragService = dragService;
            this._eventAggregator = eventAggregator;
            this._scoreService = scoreService;
        }

        GameCustomElement.prototype.attached = function attached() {
            var _this = this;

            this.highScore = this._scoreService.getScore();
            this._highSubscription = this._eventAggregator.subscribe('high', function (value) {
                if (value > _this.highScore) {
                    _this.highScore = value;
                    _this._scoreService.saveScore(value);
                }
                _this.title = value + '+' + value;
            });
            this._moveSubscription = this._eventAggregator.subscribe('moves', function (moves) {
                _this.moves = moves.moves;
            });
            this._winSubscription = this._eventAggregator.subscribe('win', function (level) {
                _this.level = level - 1;
                _this.levelClass = 'level--' + (level - 1);
            });
            this._restartSubscription = this._eventAggregator.subscribe('restart', function () {
                _this.level = 1;
                _this.levelClass = 'level--0';
            });
        };

        GameCustomElement.prototype.restart = function restart() {
            this._eventAggregator.publish('restart');
        };

        GameCustomElement.prototype.detached = function detached() {
            this._highSubscription.dispose();
            this._moveSubscription.dispose();
            this._winSubscription.dispose();
            this._restartSubscription.dispose();
        };

        return GameCustomElement;
    }()) || _class);
});
define('resources/elements/help/help',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var HelpCustomElement = exports.HelpCustomElement = function () {
        function HelpCustomElement() {
            _classCallCheck(this, HelpCustomElement);

            this.helpVisible = false;
        }

        HelpCustomElement.prototype.showHelp = function showHelp() {
            this.helpVisible = true;
        };

        HelpCustomElement.prototype.hideHelp = function hideHelp() {
            this.helpVisible = false;
        };

        return HelpCustomElement;
    }();
});
define('resources/elements/tile/tile',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'resources/services/drag-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _dragService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TileCustomElement = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

    var TileCustomElement = exports.TileCustomElement = (_dec = (0, _aureliaFramework.inject)(Element, _dragService.DragService, _aureliaEventAggregator.EventAggregator), _dec(_class = (_class2 = function () {
        function TileCustomElement(element, dragService, eventAggregator) {
            var _this = this;

            _classCallCheck(this, TileCustomElement);

            _initDefineProp(this, 'tile', _descriptor, this);

            _initDefineProp(this, 'rowTileCount', _descriptor2, this);

            _initDefineProp(this, 'maxColors', _descriptor3, this);

            _initDefineProp(this, 'win', _descriptor4, this);

            this._setRandomColor = function () {
                var maxColors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

                _this.tile.color = Math.ceil(Math.random() * maxColors);
            };

            this.dragService = dragService;
            this._eventAggregator = eventAggregator;
            this._element = element;
            this._allowedDirections = [];
            this.locked = false;
            this.animated = false;
            this.correct = false;
            this.dragged = false;
            this.visible = true;
            this.burn = false;
            this.onfire = false;
            this.dx = 0;
            this.dy = 0;
        }

        TileCustomElement.prototype.attached = function attached() {
            this._setRandomColor();
            this.tile.maxColors = this.maxColors;
            this.tile.setRandomColor = this._setRandomColor;
            this._allowedDirections = [this._allowed(this.tile.y), this._allowed(this.tile.x)];
            this._addListeners();
        };

        TileCustomElement.prototype.detached = function detached() {
            this._animateListener.dispose();
            this._burnListener.dispose();
            this._correctMoveListener.dispose();
            this._doDragListener.dispose();
            this._lockListener.dispose();
            this._onfireListener.dispose();
            this._resetMoveListener.dispose();
            this._startDragListener.dispose();
            this._stopDragListener.dispose();
            this._unlockListener.dispose();
        };

        TileCustomElement.prototype._addListeners = function _addListeners() {
            var _this2 = this;

            this._burnListener = this._eventAggregator.subscribe('burn', function () {
                _this2.burn = true;
            });

            this._onfireListener = this._eventAggregator.subscribe('onfire', function (tile) {
                if (tile.id == _this2.tile.id) {
                    _this2.onfire = true;
                }
            });

            this._animateListener = this._eventAggregator.subscribe('move', function (move) {
                if (move.tile.id == _this2.tile.id) {
                    _this2._animate(move.directions, move.animate);
                }
            });

            this._correctMoveListener = this._eventAggregator.subscribe('correct', function (tile) {
                if (tile.id == _this2.tile.id) {
                    _this2.correct = true;
                    setTimeout(function () {
                        _this2.correct = false;
                        _this2._setNextColor();
                    });
                }
            });

            this._lockListener = this._eventAggregator.subscribe('lockTiles', function (tile) {
                if (tile.element.id != _this2.tile.id) {
                    _this2.locked = true;
                }
            });

            this._unlockListener = this._eventAggregator.subscribe('unlockTiles', function () {
                _this2.locked = false;
            });

            this._resetMoveListener = this._eventAggregator.subscribe('reset', function (move) {
                if (move.tile.id == _this2.tile.id) {
                    console.log('incorrect move');
                    _this2.animated = true;
                    _this2.visible = true;
                    _this2.incorrect = true;
                    _this2.dx = 0;
                    _this2.dy = 0;
                    setTimeout(function () {
                        _this2.incorrect = false;
                    }, 400);
                }
            });

            this._startDragListener = this._eventAggregator.subscribe('startDrag', function (tile) {
                if (tile.element.id == _this2.tile.id) {
                    _this2._startDragHandler(tile);
                }
            });

            this._doDragListener = this._eventAggregator.subscribe('doDrag', function (tile) {
                if (tile.element.id == _this2.tile.id) {
                    _this2._doDragHandler(tile);
                }
            });

            this._stopDragListener = this._eventAggregator.subscribe('stopDrag', function (tile) {
                if (tile.element.id == _this2.tile.id) {
                    _this2._stopDragHandler();
                }
            });
        };

        TileCustomElement.prototype._allowed = function _allowed(value) {
            // value is tile x or y
            // returns -1, 0 or 1
            switch (value) {
                case 0:
                    return 1; // only increment allowed
                case this.rowTileCount - 1:
                    return -1; // only decrement allowed
                default:
                    return 0; // both allowed
            }
        };

        TileCustomElement.prototype._animate = function _animate(directions) {
            var _this3 = this;

            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.animated = animate;
            setTimeout(function () {
                _this3.dy = directions[0];
                _this3.dx = directions[1];
            });
        };

        TileCustomElement.prototype._startDragHandler = function _startDragHandler(tile) {
            this.dragged = true;
            this._startPosition = {
                left: tile.left,
                top: tile.top
            };
            this._delta = [0, 0];
            this._oneDelta = [0, 0];
        };

        TileCustomElement.prototype._directionAllowed = function _directionAllowed(direction, delta) {
            var allowed = this._allowedDirections[direction] != -delta; // 0 and delta is allowed
            return allowed;
        };

        TileCustomElement.prototype._drag = function _drag(directions) {
            this.dragged = true;
            this.animated = false;
            // for elastic effect
            this.dy = directions[0] / 2 + 'px';
            this.dx = directions[1] / 2 + 'px';
        };

        TileCustomElement.prototype._doDragHandler = function _doDragHandler(tile) {
            if (this.dragged) {
                this._delta[1] += tile.dx; // px
                this._delta[0] += tile.dy; // px
                // absolute delta values in px to determine the largest of the two
                var absDelta = [Math.abs(this._delta[0]), Math.abs(this._delta[1])];

                // only the largest delta is set in px; the other is zeroed to constrain move
                var direction = absDelta[1] > absDelta[0] ? 1 : 0; // x
                var delta = this._delta[direction]; // px
                this._oneDelta = [0, 0]; // px
                this._oneDelta[direction] = delta;

                this._directions = [Math.sign(this._oneDelta[0]), Math.sign(this._oneDelta[1])];
                if (this._directionAllowed(direction, this._directions[direction])) {
                    this._eventAggregator.publish('lockTiles', tile);
                    if (this._underTreshold(this._oneDelta)) {
                        this._drag(this._oneDelta);
                    } else {
                        // oneDelta mapped to -1 / 0 / 1
                        this.dragged = false;
                        var vector = {
                            tile: this.tile,
                            directions: this._directions
                        };
                        this._eventAggregator.publish('request-move', vector);
                    }
                } else {
                    this.dragged = false;
                }
            }
        };

        TileCustomElement.prototype._stopDragHandler = function _stopDragHandler() {
            if (this.dragged) {
                this.dragged = false;
                if (this._underTreshold(this._oneDelta)) {
                    this._animate([0, 0]);
                    this._eventAggregator.publish('unlockTiles');
                }
            }
        };

        TileCustomElement.prototype._underTreshold = function _underTreshold(constrainedDistance) {
            var value = Math.max(Math.abs(constrainedDistance[0]), Math.abs(constrainedDistance[1]));
            return value < 40;
        };

        TileCustomElement.prototype._setNextColor = function _setNextColor() {
            this.tile.color = this.tile.color == this.maxColors ? 1 : this.tile.color + 1;
        };

        return TileCustomElement;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'tile', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'rowTileCount', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'maxColors', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'win', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/game/game\"></require>\n    <game></game>\n</template>\n"; });
define('text!resources/elements/game/game.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/board/board\"></require>\n    <require from=\"resources/elements/help/help\"></require>\n\n    <header>\n        <h3 class=\"moves\">Moves: ${moves}<br>Level: ${level}</h3>\n        <h1 class=\"title ${levelClass}\"\n            title=\"Click to restart\"\n            click.delegate=\"restart()\">\n            <span repeat.for=\"letter of title.split('')\">${letter}</span>\n        </h1>\n        <help containerless></help>\n\n        <!-- <h2>${highScore +'+'+ highScore}</h2> -->\n    </header>\n    <board mousedown.delegate=\"dragService.startDrag($event)\"\n           touchstart.delegate=\"dragService.startDrag($event)\"\n           mousemove.delegate=\"dragService.doDrag($event)\"\n           touchmove.delegate=\"dragService.doDrag($event)\"\n           mouseup.delegate=\"dragService.stopDrag($event)\"\n           touchend.delegate=\"dragService.stopDrag($event)\"></board>\n</template>\n"; });
define('text!resources/elements/board/board.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/tile/tile\"></require>\n    <template if.bind=\"showBoard\">\n        <template repeat.for=\"row of board\">\n            <template repeat.for=\"tile of row\">\n                <tile tile.bind=\"tile\"\n                      max-colors.bind=\"maxColors\"\n                      row-tile-count.bind=\"rowTileCount\"\n                      win.bind=\"win\"\n                      containerless></tile>\n            </template>\n        </template>\n    </template>\n</template>\n"; });
define('text!resources/elements/tile/tile.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"tile tile--${tile.color}\n            ${win ? 'win' : ''}\n            ${animated ? 'animated' : ''}\n            ${dragged ? 'dragged' : ''} \n            ${burn ? 'burn' : ''} \n            ${correct ? 'correct' : ''}\n            ${incorrect ? 'incorrect' : ''}\n            ${locked ? 'locked' : ''}\n            ${onfire ? 'onfire' : ''}\n            ${visible ? '' : 'hide'}\n            x_${tile.x} y_${tile.y}\"\n         id.one-time=\"tile.id\"\n         css=\"left: calc(${tile.x} * var(--distance) + var(--tilePadding));\n            top: calc(${tile.y} * var(--distance) + var(--tilePadding));\n            transform: translate3d(calc(${dx} * var(--distance)), calc(${dy} * var(--distance)), 0);\"></div>\n</template>\n"; });
define('text!resources/elements/help/help.html', ['module'], function(module) { module.exports = "<template>\n    <button class=\"helpBubble ${helpVisible ? 'hide' : ''}\"\n    click.delegate=\"showHelp()\">?</button>\n    <div class=\"helpContent ${helpVisible ? 'up' : 'down'}\"\n         click.delegate=\"hideHelp()\">\n        <div>\n            <h2>How to play</h2>\n            <ul>\n                <li>Slide matching marbles together.</li>\n                <li>Match them all to win!</li>\n                <li>Click title to restart and keep playing!</li>\n            </ul>\n            <p><small><sup>&copy</sup> <a target=\"_blank\" href=\"/\">ashWare</a><small></p>\n            </div>\n        </div>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map