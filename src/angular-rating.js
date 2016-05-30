(function () {
    "use strict";

    angular.module("angular-rating", []).component("rating", {
        template: `<span class="rating-container" ng-mouseleave="model.setRatingValue()">
                        <span class="star glyphicon glyphicon-star" ng-class="{'star-on':entry.filled, 'star-high':entry.highlighted}"                     
                        ng-mouseover="model.fillStarHandler($index)"
                        ng-mouseleave="model.unfillStarHandler($index)"
                        ng-click="model.selectStar($index)"                    
                        style="font-size:{{model.size}};" ng-repeat="entry in model.stars track by $index"></span>
                    </span>
                    <br />
                    <div>{{model.value}}</div>`,
        bindings: {
            value: "<",
            max: "<",
            size: "@",
            color: "@",
            interactive: "@"
        },
        transclude: true,
        controllerAs: "model",
        controller: function ($timeout) {
            var model = this;
            model.originalValue = -1;
            if (isInteractive()) {
                model.value = -1;
            }
            var eventQueue = {
                type: '',
                index: -1,
                action: null,
                process: function (_type, _index) {
                    this.type = _type;
                    this.index = _index;
                    if (this.type === 0) { //unhighlight
                        var _event = this;
                        if (isDirty()) {
                            return;
                        }
                        this.action = $timeout(function () {
                            if (_event.index == 0) {
                                UnhighlightedStar(_event.index);
                            }
                        }, 100);
                    } else if (this.type === 1) { // highlight
                        reset();

                        if (this.action) {
                            $timeout.cancel(this.action);
                        }
                        for (var i = this.index; i >= 0; i--) {
                            highlightedStar(i);
                        }
                        for (var i = this.index + 1; i <= model.max - 1; i++) {
                            UnhighlightedStar(i);
                        }
                        for (var i = 0; i < model.max; i++) {
                            UnfillStar(i);
                        }
                    } else if (this.type === 2) { // select
                        setValue(this.index + 1);
                        for (var i = this.index; i >= 0; i--) {
                            fillStar(i);
                        }
                        for (var i = this.index + 1; i <= model.max - 1; i++) {
                            UnfillStar(i);
                        }
                        for (var i = 0; i < model.max; i++) {
                            UnhighlightedStar(i);
                        }
                    }
                }
            };

            if (!model.value) {
                if (model.value !== 0)
                    model.value = 1;
            }

            if (!model.size)
                model.size = '20px';

            if (!model.color)
                model.color = "#3DC31E";

            if (!model.highColor)
                model.highColor = "#F7EB90";

            if (model.max == undefined) {
                model.max = 5;
            }

            model.stars = [];
            for (var i = 0; i < model.max; i++) {
                model.stars.push({
                    filled: i < model.value
                });
            }

            model.fillStarHandler = function (starIndex) {
                if (isInteractive()) {
                    eventQueue.process(1, starIndex);
                }
            }

            model.unfillStarHandler = function (starIndex) {
                if (isInteractive()) {
                    eventQueue.process(0, starIndex);
                }
            }

            model.selectStar = function (starIndex) {
                if (isInteractive()) {
                    eventQueue.process(2, starIndex);
                }
            }

            function reset() {
                model.value = model.originalValue;
            }

            function isDirty() {
                return model.originalValue !== model.value;
            }

            function isInteractive() {
                return model.interactive.toLowerCase() == "true";
            }

            function UnmarkStar(s) {
                model.stars[s].filled = false;
                model.stars[s].highlighted = false;
                console.log('unmark: ' + s);
            }

            function fillStar(s) {
                model.stars[s].filled = true;
                console.log('fill: ' + s);
            }

            function UnfillStar(s) {
                model.stars[s].filled = false;
                console.log('unfill: ' + s);
            }

            function highlightedStar(s) {
                model.stars[s].highlighted = true;
                console.log('highlighted: ' + s);
            }

            function UnhighlightedStar(s) {
                model.stars[s].highlighted = false;
                console.log('unhighlighted: ' + s);
            }

            model.setRatingValue = function () {
                for (var i = model.value - 1; i >= 0; i--) {
                    fillStar(i);
                }
                for (var i = model.value + 1; i <= model.max - 1; i++) {
                    UnfillStar(i);
                }
                for (var i = 0; i < model.max; i++) {
                    UnhighlightedStar(i);
                }
            }

            function setUserSelection(val) {
                model.originalValue = val;
            }

            function setValue(val) {
                model.value = val;
                model.originalValue = val;
            }

            // the following is the insertion of styles into page onload
            var rating = {
                selector: 'rating',
                rules: [
                    'text-align: center',
                    'display: block',
                    'padding-bottom: 3px'
                ]
            }
            var star = {
                selector: '.star',
                rules: [
                    'font-size: 18px',
                    'color: #ddd',
                    'cursor: pointer'
                ]
            }
            var starOthers = {
                selector: '.star+.star',
                rules: [
                    'margin-left: 3px'
                ]
            }
            var starOn = {
                selector: '.star.star-on',
                rules: [
                    'color:' + model.color
                ]
            }
            var starHigh = {
                selector: '.star.star-high',
                rules: [
                    'color:' + model.highColor
                ]
            }

            var ratingCSS = rating.selector + '{' + rating.rules.join(';') + '}';
            var starCSS = star.selector + '{' + star.rules.join(';') + '}';
            var starOthersCSS = starOthers.selector + '{' + starOthers.rules.join(';') + '}';
            var starOnCSS = starOn.selector + '{' + starOn.rules.join(';') + '}';
            var starHighCSS = starHigh.selector + '{' + starHigh.rules.join(';') + '}';
            angular.element(document).find('head').prepend('<style type="text/css">' + ratingCSS + starCSS + starOthersCSS + starOnCSS + starHighCSS + '</style>');

        }
    });

} ());