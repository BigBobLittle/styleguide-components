angular.module("tw.layout-components", []);
!function(angular) {
    "use strict";
    function CardController($transclude, TwCardsService) {
        var $ctrl = this;
        $ctrl.hasForm = $transclude.isSlotFilled("cardForm"), $ctrl.toggle = TwCardsService.toggle, 
        $ctrl.addCard = TwCardsService.addCard, $ctrl.getExpandedIndex = TwCardsService.getExpandedIndex, 
        $ctrl.updateExpandedIndex = TwCardsService.updateExpandedIndex, $ctrl.getCard = TwCardsService.getCard, 
        $ctrl.getLength = TwCardsService.getLength;
    }
    function Card() {
        return {
            require: {
                cardContainerController: "^twCards"
            },
            controllerAs: "$ctrl",
            bindToController: !0,
            replace: !0,
            scope: {
                state: "@",
                index: "<",
                open: "<?",
                disabled: "=?",
                inactive: "<"
            },
            transclude: {
                collapsedCard: "collapsed",
                expandedCard: "expanded",
                cardForm: "?cardForm",
                cardIcon: "cardIcon"
            },
            controller: [ "$transclude", "TwCardsService", CardController ],
            template: templateStr,
            link: function($scope, $element, $attrs, $ctrl) {
                var cardController = $scope.$ctrl;
                cardController.addCard(cardController), cardController.index = cardController.getLength() - 1, 
                cardController.inactive = $ctrl.cardContainerController.inactive, cardController.open === !0 && cardController.getExpandedIndex() === -1 ? cardController.updateExpandedIndex(cardController.index) : cardController.open = !1, 
                null == cardController.disabled && (cardController.disabled = !1);
            }
        };
    }
    function CardContainerController() {}
    function CardContainer() {
        return {
            scope: {
                inactive: "=?"
            },
            controllerAs: "$ctrl",
            controller: CardContainerController,
            bindToController: !0,
            transclude: !0,
            template: '<ul ng-transclude class="list-group panel-list-group list-group-slide-out"                             ng-class="{\'list-group-inactive\': $ctrl.inactive}">                         </ul>'
        };
    }
    angular.module("tw.layout-components").directive("twCards", CardContainer).directive("twCard", Card);
    var collapsedCardTemplate = '<div class="p-a-panel" role="button" ng-click="$ctrl.toggle($ctrl.index)">             <div class="media">                 <div class="media-left">                     <div class="circle circle-sm circle-responsive" ng-class="{                             \'circle-inverse\': !$ctrl.inactive }">                         <div ng-transclude="cardIcon"></div>                     </div>                 </div>                 <div class="media-body" ng-transclude="collapsedCard"></div>             </div>         </div>', expandedCardTemplate = '<div   class="collapse"                 ng-attr-aria-expanded="{{ $ctrl.open }}"                 ng-class="{\'in\': $ctrl.open }"                 ng-if="$ctrl.open" >             <div class="p-l-panel p-r-panel p-b-panel">                 <div class="media">                     <div class="media-left">                         <div class="circle circle-sm circle-inverse circle-responsive invisible"></div>                     </div>                 <div class="media-body">                     <hr class="m-t-0 hidden-xs hidden-sm" />                     <a  href="" ng-click="$ctrl.toggle($ctrl.index)"                         class="visible-xs-inline-block visible-sm-inline-block text-no-decoration m-t-1"                         style="margin-left: -8px;">                         <i class="icon icon-left-arrow icon-xxl"></i>                     </a>                     <div ng-transclude="expandedCard"></div>                 </div>             </div>         </div>', cardFormTemplate = '<div class="well p-l-panel p-r-panel" ng-if="$ctrl.hasForm">             <div class="media">                 <div class="media-left">                     <div class="circle circle-sm circle-responsive invisible"></div>                 </div>                 <div class="media-body" ng-transclude="cardForm"></div>             </div>         </div>', templateStr = "<li    class=\"list-group-item p-a-0 list-group-item-{{$ctrl.state}}\"                 ng-class=\"{                     'active': $ctrl.open,                     'disabled': $ctrl.disabled                 }\">" + collapsedCardTemplate + expandedCardTemplate + cardFormTemplate + "</li>";
}(window.angular);