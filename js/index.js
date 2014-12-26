(function() {
  angular.module('IdleLands', ['ngMaterial', 'ngSanitize', 'angularMoment', 'ui.router', 'LocalStorageModule', 'xeditable']);

  angular.module('IdleLands').run([
    'editableThemes', function(editableThemes) {
      editableThemes["default"].cancelTpl = '<md-button class="xeditable-form-button md-theme-red" ng-click="$form.$cancel()">Cancel</md-button>';
      return editableThemes["default"].submitTpl = '<md-button class="xeditable-form-button md-theme-green" type="submit">Save</md-button>';
    }
  ]);

  angular.module('IdleLands').config(['$locationProvider', function($loc) {}]);

  if (window.location.host === 'idlelands.github.io' && window.location.protocol !== 'https:') {
    window.location.protocol = 'https:';
  }

}).call(this);

(function() {
  angular.module('IdleLands').config([
    '$stateProvider', '$urlRouterProvider', '$httpProvider', function($sp, $urp, $httpProvider) {
      $httpProvider.interceptors.push('TokenInterceptor');
      $httpProvider.interceptors.push('ToastInterceptor');
      $httpProvider.interceptors.push('PlayerInterceptor');
      $httpProvider.interceptors.push('PetInterceptor');
      $httpProvider.interceptors.push('PetsInterceptor');
      $httpProvider.interceptors.push('ReloginInterceptor');
      $urp.otherwise('/login');
      $urp.when('/player', '/player/overview');
      return $sp.state('login', {
        url: '/login',
        templateUrl: 'login',
        controller: 'Login'
      }).state('pet', {
        url: '/pet',
        templateUrl: 'pet',
        controller: 'Pet'
      }).state('pet.overview', {
        url: '/overview',
        data: {
          selectedTab: 0
        },
        views: {
          'petoverview': {
            templateUrl: 'pet-overview',
            controller: 'PetOverview'
          }
        }
      }).state('pet.equipment', {
        url: '/equipment',
        data: {
          selectedTab: 1
        },
        views: {
          'petequipment': {
            templateUrl: 'pet-equipment',
            controller: 'PetEquipment'
          }
        }
      }).state('pet.inventory', {
        url: '/inventory',
        data: {
          selectedTab: 2
        },
        views: {
          'petinventory': {
            templateUrl: 'pet-inventory',
            controller: 'PetInventory'
          }
        }
      }).state('player', {
        url: '/player',
        templateUrl: 'player',
        controller: 'Player'
      }).state('player.overview', {
        url: '/overview',
        data: {
          selectedTab: 0
        },
        views: {
          'overview': {
            templateUrl: 'player-overview',
            controller: 'PlayerOverview'
          }
        }
      }).state('player.map', {
        url: '/map',
        data: {
          selectedTab: 1
        },
        views: {
          'map': {
            templateUrl: 'player-map',
            controller: 'PlayerMap'
          }
        }
      }).state('player.equipment', {
        url: '/equipment',
        data: {
          selectedTab: 2
        },
        views: {
          'equipment': {
            templateUrl: 'player-equipment',
            controller: 'PlayerEquipment'
          }
        }
      }).state('player.battle', {
        url: '/battle',
        data: {
          selectedTab: 3
        },
        views: {
          'battle': {
            templateUrl: 'player-battle',
            controller: 'PlayerBattle'
          }
        }
      }).state('player.collectibles', {
        url: '/collectibles',
        data: {
          selectedTab: 4
        },
        views: {
          'collectibles': {
            templateUrl: 'player-collectibles',
            controller: 'PlayerCollectibles'
          }
        }
      }).state('player.achievements', {
        url: '/achievements',
        data: {
          selectedTab: 5
        },
        views: {
          'achievements': {
            templateUrl: 'player-achievements',
            controller: 'PlayerAchievements'
          }
        }
      }).state('player.statistics', {
        url: '/statistics',
        data: {
          selectedTab: 6
        },
        views: {
          'statistics': {
            templateUrl: 'player-statistics',
            controller: 'PlayerStatistics'
          }
        }
      }).state('player.options', {
        url: '/options',
        data: {
          selectedTab: 7
        },
        views: {
          'options': {
            templateUrl: 'player-options',
            controller: 'PlayerOptions'
          }
        }
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('Head', [
    '$scope', '$interval', 'TurnTaker', 'CurrentPlayer', function($scope, $interval, TurnTaker, Player) {
      $scope.player = null;
      return Player.observe().then(null, null, function(newVal) {
        $scope.player = newVal;
        return TurnTaker.beginTakingTurns($scope.player);
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('Home', [
    '$scope', '$state', function($scope, $state) {
      return $state.go('player.overview');
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('Login', [
    '$scope', '$state', 'API', 'CredentialCache', function($scope, $state, API, CredentialCache) {
      var goToPlayerView;
      $scope.selectedIndex = 0;
      $scope.selectTab = function(tabIndex) {
        return $scope.selectedIndex = tabIndex;
      };
      $scope.login = {};
      $scope.register = {};
      $scope.advLogin = {};
      $scope.isSubmitting = false;
      $scope.nameToIdentifier = function(name) {
        return "web-fe#" + name;
      };
      goToPlayerView = function() {
        return $state.go('player.overview');
      };
      $scope.doLogin = function() {
        var data;
        data = _.clone($scope.login);
        data.identifier = $scope.nameToIdentifier(data.name);
        return $scope.sendLogin(data);
      };
      $scope.doAdvancedLogin = function() {
        return $scope.sendLogin($scope.advLogin);
      };
      $scope.doRegister = function() {
        var data;
        $scope.isSubmitting = true;
        data = _.clone($scope.register);
        data.identifier = $scope.nameToIdentifier(data.name);
        return API.auth.register(data).then(function(res) {
          if (res.data.isSuccess) {
            CredentialCache.setCreds(data);
          }
          goToPlayerView();
          return $scope.isSubmitting = false;
        });
      };
      return $scope.sendLogin = function(data) {
        var failure, success;
        $scope.isSubmitting = true;
        success = function(res) {
          if (res.data.isSuccess) {
            CredentialCache.setCreds(data);
            goToPlayerView();
          }
          return $scope.isSubmitting = false;
        };
        failure = function(res) {
          return $scope.isSubmitting = false;
        };
        return API.auth.login(data).then(success, failure);
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('Pet', [
    '$scope', '$state', '$window', '$timeout', 'CurrentPet', 'CurrentPlayer', 'CredentialCache', 'TurnTaker', function($scope, $state, $window, $timeout, Pet, Player, CredentialCache, TurnTaker) {
      if (!Player.getPlayer()) {
        CredentialCache.tryLogin().then((function() {
          if (!Player.getPlayer()) {
            $mdToast.show({
              template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
            });
            return $state.go('login');
          } else {
            return TurnTaker.beginTakingTurns(Player.getPlayer());
          }
        }), (function() {
          $mdToast.show({
            template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
          });
          return $state.go('login');
        }));
      }
      $scope.xpPercent = 0;
      $scope._ = $window._;
      $window.scrollTo(0, document.body.scrollHeight);
      $scope.calcXpPercent = function() {
        return $scope.xpPercent = ($scope.pet.xp.__current / $scope.pet.xp.maximum) * 100;
      };
      $scope.valueToColor = function(value) {
        if (value < 0) {
          return 'text-red';
        }
        if (value > 0) {
          return 'text-green';
        }
      };
      $scope.initialize = function() {
        return $scope.calcXpPercent();
      };
      Pet.observe().then(null, null, function(newVal) {
        $scope.pet = newVal;
        return $scope.initialize();
      });
      return $scope.selectedIndex = $state.current.data.selectedTab;
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PetEquipment', [
    '$scope', 'CurrentPet', 'ItemUtilities', 'API', function($scope, Pet, ItemUtilities, API) {
      $scope.itemUtilities = ItemUtilities;
      $scope.organizePetItems = function() {
        return $scope.sortedPetEquipment = _($scope.pet.equipment).reject(function(item) {
          return item.type === 'pet soul';
        }).sortBy(function(item) {
          return item.type;
        }).value();
      };
      $scope.getPetSoulAndTotals = function() {
        var items, oldItems, petSoul, test;
        oldItems = $scope.petItems;
        items = [];
        test = _.reduce(oldItems, function(prev, cur) {
          var key, val;
          for (key in cur) {
            val = cur[key];
            if (!(key in prev) && _.isNumber(val)) {
              prev[key] = 0;
            }
            if (_.isNumber(val)) {
              prev[key] += val;
            }
          }
          return prev;
        }, {
          name: 'Equipment Stat Totals',
          type: 'TOTAL',
          itemClass: 'total',
          hideButtons: true
        });
        items.push(test);
        petSoul = _.findWhere(oldItems, {
          type: 'pet soul'
        });
        petSoul.hideButtons = true;
        items.push(petSoul);
        return items;
      };
      $scope.sortPetItems = function() {
        $scope.petItems = $scope.pet.equipment;
        $scope.petSoulEtc = $scope.getPetSoulAndTotals();
        return $scope.organizePetItems();
      };
      $scope.itemItemScore = function(item) {
        if (!item._baseScore || !item._calcScore) {
          return 0;
        }
        return parseInt((item._calcScore / item._baseScore) * 100);
      };
      $scope.petItemScore = function(item) {
        if (!item._calcScore || !$scope.player._baseStats.itemFindRange) {
          return 0;
        }
        return parseInt((item._calcScore / $scope.player._baseStats.itemFindRange) * 100);
      };
      $scope.unequipItem = function(item) {
        return API.pet.unequipItem({
          itemUid: item.uid
        });
      };
      Pet.observe().then(null, null, function() {
        return $scope.sortPetItems();
      });
      return $scope.sortPetItems();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PetInventory', [
    '$scope', 'CurrentPet', 'ItemUtilities', 'API', function($scope, Pet, ItemUtilities, API) {
      $scope.itemUtilities = ItemUtilities;
      $scope.canEquipItem = function(item) {
        if (!_.contains($scope.petSlots, item.type)) {
          return false;
        }
        if ($scope.slotsTaken[item.type] === $scope.pet._configCache.slots[item.type]) {
          return false;
        }
        return true;
      };
      $scope.sortPetItems = function() {
        return $scope.petItems = $scope.pet.inventory;
      };
      $scope.itemItemScore = function(item) {
        if (!item._baseScore || !item._calcScore) {
          return 0;
        }
        return parseInt((item._calcScore / item._baseScore) * 100);
      };
      $scope.petItemScore = function(item) {
        if (!item._calcScore || !$scope.pet._baseStats.itemFindRange) {
          return 0;
        }
        return parseInt((item._calcScore / $scope.pet._baseStats.itemFindRange) * 100);
      };
      $scope.sellItem = function(itemSlot) {
        return API.pet.sellItem({
          itemSlot: itemSlot
        });
      };
      $scope.swapItem = function(itemSlot) {
        return API.pet.takeItem({
          itemSlot: itemSlot
        });
      };
      $scope.equipItem = function(item, itemSlot) {
        if (!$scope.canEquipItem(item)) {
          return;
        }
        return API.pet.equipItem({
          itemSlot: itemSlot
        });
      };
      $scope.initialize = function() {
        $scope.petSlots = _.keys($scope.pet._configCache.slots);
        $scope.slotsTaken = _.countBy($scope.pet.equipment, 'type');
        return $scope.sortPetItems();
      };
      Pet.observe().then(null, null, function() {
        return $scope.initialize();
      });
      return $scope.initialize();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PetOverview', [
    '$scope', '$timeout', '$mdDialog', 'CurrentPet', 'CurrentPets', 'CurrentPlayer', 'API', '$state', function($scope, $timeout, $mdDialog, Pet, Pets, Player, API, $state) {
      $scope.equipmentStatArray = [
        {
          name: 'str',
          fa: 'fa-legal fa-rotate-90'
        }, {
          name: 'dex',
          fa: 'fa-crosshairs'
        }, {
          name: 'agi',
          fa: 'fa-bicycle'
        }, {
          name: 'con',
          fa: 'fa-heart'
        }, {
          name: 'int',
          fa: 'fa-mortar-board'
        }, {
          name: 'wis',
          fa: 'fa-book'
        }, {
          name: 'luck',
          fa: 'fa-moon-o'
        }, {
          name: 'fire',
          fa: 'fa-fire'
        }, {
          name: 'water',
          fa: 'icon-water'
        }, {
          name: 'thunder',
          fa: 'fa-bolt'
        }, {
          name: 'earth',
          fa: 'fa-leaf'
        }, {
          name: 'ice',
          fa: 'icon-snow'
        }
      ];
      $scope.getGenderFor = function(player) {
        switch (player.gender) {
          case 'male':
            return 'male';
          case 'female':
            return 'female';
          default:
            return 'question';
        }
      };
      $scope.getTypeIcon = function(pet) {
        switch (pet._configCache.category) {
          case 'Non-Combat':
            return 'book';
          case 'Combat':
            return 'bomb';
          default:
            return 'adjust';
        }
      };
      $scope.pets = [];
      $scope.toPlayerView = function() {
        return $state.go('player.overview');
      };
      $scope.boughtPets = function() {
        var pets;
        pets = 0;
        _.each(_.keys($scope.player.foundPets), function(petKey) {
          if ($scope.player.foundPets[petKey].purchaseDate) {
            return pets++;
          }
        });
        return pets;
      };
      $scope.availablePets = function() {
        var pets, _ref;
        pets = [];
        _.each(_.keys((_ref = $scope.player) != null ? _ref.foundPets : void 0), function(petKey) {
          var pet;
          pet = $scope.player.foundPets[petKey];
          if (pet.purchaseDate) {
            return;
          }
          pet.type = petKey;
          return pets.push(pet);
        });
        return pets;
      };
      $scope.tryToBuyPet = function(pet) {
        if (!$scope.canBuyPet(pet)) {
          return;
        }
        return $mdDialog.show({
          templateUrl: 'buy-pet',
          controller: 'PetBuy',
          locals: {
            petType: pet.type
          }
        });
      };
      $scope.canBuyPet = function(pet) {
        return pet.cost <= $scope.player.gold.__current;
      };
      $scope.getSmartIcon = function(type) {
        if (!$scope.pet) {
          return;
        }
        if ($scope.pet["smart" + type]) {
          return 'check';
        } else {
          return 'remove';
        }
      };
      $scope.toggleSmart = function(type) {
        type = "smart" + type;
        return API.pet.setSmart({
          option: type,
          value: !$scope.pet[type]
        });
      };
      $scope.doPetSwap = function(newPetUid) {
        return API.pet.swapToPet({
          petId: newPetUid
        });
      };
      $scope.feedPet = function() {
        return API.pet.feedPet();
      };
      $scope.takePetGold = function() {
        return API.pet.takeGold();
      };
      $scope.upgradeStat = function(stat) {
        return API.pet.upgradePet({
          stat: stat
        });
      };
      $scope.petUpgradeData = {
        inventory: {
          stat: 'Inventory Size',
          gift: 'Inventory size is %gift'
        },
        maxLevel: {
          stat: 'Max Level',
          gift: 'Max level is %gift'
        },
        goldStorage: {
          stat: 'Gold Storage',
          gift: 'Gold storage is %gift'
        },
        battleJoinPercent: {
          stat: 'Combat Aid Chance',
          gift: 'Battle join chance is %gift'
        },
        itemFindBonus: {
          stat: 'Item Find Bonus',
          gift: 'Bonus to found items is %gift'
        },
        itemFindTimeDuration: {
          stat: 'Item Find Time',
          gift: 'New item every %gifts'
        },
        itemSellMultiplier: {
          stat: 'Item Sell Bonus',
          gift: 'Sell bonus is %gift'
        },
        itemFindRangeMultiplier: {
          stat: 'Item Equip Bonus',
          gift: 'Bonus to equipping is %gift'
        },
        maxItemScore: {
          stat: 'Max Item Score',
          gift: 'Highest findable score is %gift'
        },
        xpPerGold: {
          stat: 'XP / gold',
          gift: 'Gain %gift xp per gold fed to pet'
        }
      };
      $scope.formatGift = function(key, gift) {
        switch (key) {
          case 'battleJoinPercent':
            return "" + gift + "%";
          case 'goldStorage':
            return _.str.numberFormat(gift);
          case 'itemFindBonus':
            return "+" + gift;
          case 'itemFindRangeMultiplier':
          case 'itemSellMultiplier':
            return "" + (Math.round(gift * 100)) + "%";
          default:
            return gift;
        }
      };
      $scope.getPetsInOrder = function() {
        return _.sortBy($scope.pets, function(pet) {
          return !pet.isActive;
        });
      };
      $scope.initialize = function() {
        $scope.pets = Pets.getPets();
        return $scope.player = Player.getPlayer();
      };
      Pets.observe().then(null, null, function() {
        return $scope.pets = Pets.getPets();
      });
      Player.observe().then(null, null, function() {
        return $scope.player = Player.getPlayer();
      });
      return $scope.initialize();
    }
  ]);

  angular.module('IdleLands').controller('PetBuy', [
    '$scope', '$mdDialog', 'petType', 'API', function($scope, $mdDialog, petType, API) {
      $scope.newPet = {
        name: '',
        attr1: 'a monocle',
        attr2: 'a top hat'
      };
      $scope.petType = petType;
      $scope.cancel = $mdDialog.hide;
      return $scope.purchase = function() {
        var petAttrs;
        petAttrs = {
          type: petType,
          attrs: [$scope.newPet.attr1, $scope.newPet.attr2],
          name: $scope.newPet.name
        };
        return API.pet.buyPet(petAttrs).then(function(res) {
          if (!res.data.isSuccess) {
            return;
          }
          return $mdDialog.hide();
        });
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerAchievements', [
    '$scope', function($scope) {
      return $scope.achievementTypeToIcon = {
        'class': ['fa-child'],
        'event': ['fa-info'],
        'combat': ['fa-legal', 'fa-magic fa-rotate-90'],
        'special': ['fa-gift'],
        'personality': ['fa-group'],
        'exploration': ['fa-compass'],
        'progress': ['fa-signal']
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerBattle', [
    '$scope', 'BattleColorMap', 'CurrentBattle', function($scope, BattleColorMap, CurrentBattle) {
      $scope.filterMessage = function(message) {
        var regexp, replaceFunc, search;
        for (search in BattleColorMap) {
          replaceFunc = BattleColorMap[search];
          regexp = new RegExp("(<" + search + ">)([\\s\\S]*?)(<\\/" + search + ">)", 'g');
          message = message.replace(regexp, function(match, p1, p2) {
            return replaceFunc(p2);
          });
        }
        return message;
      };
      return $scope.currentBattle = CurrentBattle.getBattle();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerCollectibles', ['$scope', function() {}]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('Player', [
    '$scope', '$state', '$window', '$timeout', '$mdToast', 'API', 'CurrentPlayer', 'TurnTaker', 'CredentialCache', 'OptionsCache', function($scope, $state, $window, $timeout, $mdToast, API, Player, TurnTaker, CredentialCache, OptionsCache) {
      if (!Player.getPlayer()) {
        CredentialCache.tryLogin().then((function() {
          if (!Player.getPlayer()) {
            $mdToast.show({
              template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
            });
            return $state.go('login');
          } else {
            return TurnTaker.beginTakingTurns(Player.getPlayer());
          }
        }), (function() {
          $mdToast.show({
            template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
          });
          return $state.go('login');
        }));
      }
      OptionsCache.load(['scrollback']);
      $scope.options = OptionsCache.getOpts();
      $scope.xpPercent = 0;
      $scope.statisticsKeys = {};
      $scope._ = $window._;
      $window.scrollTo(0, document.body.scrollHeight);
      $scope.calcXpPercent = function() {
        var _ref, _ref1;
        return $scope.xpPercent = (((_ref = $scope.player) != null ? _ref.xp.__current : void 0) / ((_ref1 = $scope.player) != null ? _ref1.xp.maximum : void 0)) * 100;
      };
      $scope.logout = function() {
        Player.setPlayer(null);
        CredentialCache.doLogout();
        API.auth.logout();
        return $state.go('login');
      };
      $scope.valueToColor = function(value) {
        if (value < 0) {
          return 'text-red';
        }
        if (value > 0) {
          return 'text-green';
        }
      };
      $scope.handleScrollback = function() {
        var classFunc, scrollback;
        classFunc = $scope.options.scrollback === 'true' ? 'removeClass' : 'addClass';
        return scrollback = (angular.element('.scrollback-toast'))[classFunc]('hidden');
      };
      $timeout($scope.handleScrollback, 3000);
      $scope.turnTimeValue = 0;
      TurnTaker.observe().then(null, null, function(newVal) {
        return $scope.turnTimeValue = newVal * 10;
      });
      $scope.initialize = function() {
        var _ref;
        $scope.player = Player.getPlayer();
        $window.scrollback.nick = (_ref = $scope.player) != null ? _ref.name : void 0;
        return $scope.calcXpPercent();
      };
      Player.observe().then(null, null, function() {
        return $scope.initialize();
      });
      $scope.initialize();
      $scope.$watch('options', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }
        OptionsCache.saveAll();
        return $scope.handleScrollback();
      }, true);
      return $scope.selectedIndex = $state.current.data.selectedTab;
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerEquipment', [
    '$scope', 'CurrentPlayer', 'ItemUtilities', 'API', function($scope, Player, ItemUtilities, API) {
      $scope.itemUtilities = ItemUtilities;
      $scope.getEquipmentAndTotals = function(oldItems) {
        var items, test;
        items = _.clone(oldItems);
        test = _.reduce(items, function(prev, cur) {
          var key, val;
          for (key in cur) {
            val = cur[key];
            if (!(key in prev) && _.isNumber(val)) {
              prev[key] = 0;
            }
            if (_.isNumber(val)) {
              prev[key] += val;
            }
          }
          return prev;
        }, {
          name: 'Equipment Stat Totals',
          type: 'TOTAL',
          itemClass: 'total',
          hideButtons: true
        });
        items.unshift(test);
        return items;
      };
      $scope.getOverflows = function() {
        var items, overflow, shop;
        items = [];
        shop = $scope.player.shop;
        if (shop) {
          _.each(shop.slots, function(slot, index) {
            var item;
            item = slot.item;
            item.cost = slot.price;
            item.extraItemClass = 'shop';
            item.extraText = "SHOP " + index;
            item.shopSlot = index;
            return items.push(item);
          });
        }
        overflow = $scope.player.overflow;
        if (overflow) {
          _.each(overflow, function(item, index) {
            if (!item) {
              return;
            }
            item.extraItemClass = 'extra';
            item.extraText = "SLOT " + index;
            item.overflowSlot = index;
            return items.push(item);
          });
        }
        return items;
      };
      $scope.sortPlayerItems = function() {
        return $scope.playerItems = (_.sortBy($scope.getEquipmentAndTotals($scope.player.equipment), function(item) {
          return item.type;
        })).concat($scope.getOverflows());
      };
      $scope.itemItemScore = function(item) {
        if (!item._baseScore || !item._calcScore) {
          return 0;
        }
        return parseInt((item._calcScore / item._baseScore) * 100);
      };
      $scope.playerItemScore = function(item) {
        if (!item._calcScore || !$scope.player._baseStats.itemFindRange) {
          return 0;
        }
        return parseInt((item._calcScore / $scope.player._baseStats.itemFindRange) * 100);
      };
      $scope.sellItem = function(item) {
        return API.inventory.sell({
          invSlot: item.overflowSlot
        });
      };
      $scope.swapItem = function(item) {
        return API.inventory.swap({
          invSlot: item.overflowSlot
        });
      };
      $scope.invItem = function(item) {
        return API.inventory.add({
          itemSlot: item.type
        });
      };
      $scope.buyItem = function(item) {
        return API.shop.buy({
          shopSlot: item.shopSlot
        });
      };
      $scope.sendToPet = function(item) {
        return API.pet.giveItem({
          itemSlot: item.overflowSlot
        });
      };
      Player.observe().then(null, null, function() {
        return $scope.sortPlayerItems();
      });
      return $scope.sortPlayerItems();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerMap', [
    '$scope', '$timeout', 'CurrentPlayer', 'CurrentMap', 'BaseURL', function($scope, $timeout, Player, CurrentMap, BaseURL) {
      var game, mapName, newMapName, sprite, text, textForPlayer;
      $scope.currentMap = {};
      sprite = null;
      game = null;
      mapName = null;
      newMapName = null;
      text = null;
      textForPlayer = function(player) {
        return "" + player.map + " (" + player.mapRegion + ")\n" + player.x + ", " + player.y;
      };
      $scope.drawMap = function() {
        var phaserOpts, player;
        if (_.isEmpty($scope.currentMap)) {
          return;
        }
        player = $scope.player;
        if (!newMapName) {
          newMapName = player.map;
        }
        if (text) {
          text.text = textForPlayer(player);
        }
        if (sprite) {
          sprite.x = player.x * 16;
          sprite.y = player.y * 16;
          game.camera.x = sprite.x;
          game.camera.y = sprite.y;
          if (player.map !== mapName) {
            newMapName = player.map;
            mapName = player.map;
          }
        }
        phaserOpts = {
          preload: function() {
            this.game.load.image('tiles', "" + BaseURL + "/img/tiles.png", 16, 16);
            this.game.load.spritesheet('interactables', "" + BaseURL + "/img/tiles.png", 16, 16);
            return this.game.load.tilemap(newMapName, null, $scope.currentMap.map, Phaser.Tilemap.TILED_JSON);
          },
          create: function() {
            var i, map, terrain, _i, _len, _ref;
            map = this.game.add.tilemap(newMapName);
            map.addTilesetImage('tiles', 'tiles');
            terrain = map.createLayer('Terrain');
            terrain.resizeWorld();
            map.createLayer('Blocking');
            _ref = [1, 2, 12, 13, 14, 15, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              map.createFromObjects('Interactables', i, 'interactables', i - 1);
            }
            sprite = this.game.add.sprite(player.x * 16, player.y * 16, 'interactables', 12);
            this.game.camera.follow(sprite);
            text = this.game.add.text(10, 10, textForPlayer(player), {
              font: '15px Arial',
              fill: '#fff',
              stroke: '#000',
              strokeThickness: 3
            });
            return text.fixedToCamera = true;
          }
        };
        if ((!player) || game) {
          return;
        }
        $timeout(function() {
          if (game) {
            return;
          }
          return game = new Phaser.Game('100%', '100%', Phaser.CANVAS, 'map', phaserOpts);
        }, 0);
        return null;
      };
      $scope.initializeMap = function() {
        $scope.currentMap = CurrentMap.getMap();
        return game != null ? game.state.restart() : void 0;
      };
      CurrentMap.observe().then(null, null, function() {
        return $scope.initializeMap();
      });
      $scope.initializeMap();
      Player.observe().then(null, null, function() {
        return $scope.drawMap();
      });
      return $scope.drawMap();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerOptions', [
    '$scope', '$timeout', 'CurrentPlayer', 'OptionsCache', 'API', function($scope, $timeout, Player, OptionsCache, API) {
      var initializing, isChanging;
      initializing = true;
      $scope.options = OptionsCache.getOpts();
      $scope.strings = {
        keys: [],
        values: []
      };
      $scope.buildStringList = function() {
        var _ref, _ref1;
        $scope.strings.keys = _.keys((_ref = $scope.player) != null ? _ref.messages : void 0);
        $scope.strings.values = _.values((_ref1 = $scope.player) != null ? _ref1.messages : void 0);
        return $scope.strings.keys.push('');
      };
      $scope.updateStrings = function() {
        var newVal, oldVal, propDiff;
        oldVal = $scope.player.messages || {};
        newVal = _.zipObject($scope.strings.keys, $scope.strings.values);
        propDiff = _.omit(newVal, function(v, k) {
          return oldVal[k] === v;
        });
        if (_.isEmpty(propDiff)) {
          return;
        }
        $scope.player.messages = newVal;
        _.each(_.keys(propDiff), function(key) {
          return API.strings.set({
            type: key,
            msg: propDiff[key]
          });
        });
        return $scope.buildStringList();
      };
      $scope.removeString = function(key, index) {
        return API.strings.remove({
          type: key
        }).then(function() {
          $scope.strings.keys = _.reject($scope.strings.keys, function(key, kI) {
            return index === kI;
          });
          $scope.strings.values = _.reject($scope.strings.values, function(key, kI) {
            return index === kI;
          });
          $scope.player.messages = _.omit($scope.player.messages, key);
          return $scope.buildStringList();
        });
      };
      $scope.$watch('strings', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }
        return $scope.updateStrings();
      }, true);
      $scope.$watch('player.pushbulletApiKey', function(newVal, oldVal) {
        if (newVal === oldVal || initializing) {
          return;
        }
        return API.pushbullet.set({
          apiKey: newVal
        });
      });
      $scope.$watch('player.gender', function(newVal, oldVal) {
        if (newVal === oldVal || initializing) {
          return;
        }
        return API.gender.set({
          gender: newVal
        });
      });
      isChanging = false;
      $scope.$watch('player.priorityPoints', function(newVal, oldVal) {
        var propDiff;
        if (newVal === oldVal || !oldVal) {
          return;
        }
        propDiff = _.omit(newVal, function(v, k) {
          return oldVal[k] === v;
        });
        if (_.isEmpty(propDiff)) {
          return;
        }
        return _.each(_.keys(propDiff), function(prop) {
          if ($scope.player.priorityPoints[prop] < 0) {
            isChanging = true;
            $scope.player.priorityPoints[prop] = 0;
            $timeout(function() {
              return isChanging = false;
            }, 0);
            return;
          }
          if (isChanging) {
            return;
          }
          propDiff[prop] = newVal[prop] - oldVal[prop];
          if ((Math.abs(propDiff[prop])) !== 1) {
            return;
          }
          isChanging = true;
          return API.priority.add({
            stat: prop,
            points: propDiff[prop]
          }).then(function(res) {
            if (res.data.isSuccess) {
              isChanging = false;
              return;
            }
            $scope.player.priorityPoints[prop] -= propDiff[prop];
            return $timeout(function() {
              return isChanging = false;
            }, 0);
          });
        });
      }, true);
      $scope.initialize = function() {
        initializing = true;
        $scope.player = Player.getPlayer();
        $scope.buildStringList();
        return $timeout(function() {
          return initializing = false;
        }, 0);
      };
      Player.observe().then(null, null, function() {
        return $scope.initialize();
      });
      return $scope.initialize();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerOverview', [
    '$scope', '$timeout', '$interval', '$state', 'CurrentPlayer', 'API', 'CurrentBattle', 'FunMessages', function($scope, $timeout, $interval, $state, Player, API, CurrentBattle, FunMessages) {
      var initializing;
      initializing = true;
      $scope.personalityToggle = {};
      $scope.equipmentStatArray = [
        {
          name: 'str',
          fa: 'fa-legal fa-rotate-90'
        }, {
          name: 'dex',
          fa: 'fa-crosshairs'
        }, {
          name: 'agi',
          fa: 'fa-bicycle'
        }, {
          name: 'con',
          fa: 'fa-heart'
        }, {
          name: 'int',
          fa: 'fa-mortar-board'
        }, {
          name: 'wis',
          fa: 'fa-book'
        }, {
          name: 'luck',
          fa: 'fa-moon-o'
        }, {
          name: 'fire',
          fa: 'fa-fire'
        }, {
          name: 'water',
          fa: 'icon-water'
        }, {
          name: 'thunder',
          fa: 'fa-bolt'
        }, {
          name: 'earth',
          fa: 'fa-leaf'
        }, {
          name: 'ice',
          fa: 'icon-snow'
        }
      ];
      $scope.eventTypeToIcon = {
        'item-mod': ['fa-legal', 'fa-magic fa-rotate-90'],
        'item-find': ['icon-feather'],
        'item-enchant': ['fa-magic'],
        'item-switcheroo': ['icon-magnet'],
        'shop': ['fa-money'],
        'shop-fail': ['fa-money'],
        'profession': ['fa-child'],
        'explore': ['fa-globe'],
        'levelup': ['icon-universal-access'],
        'achievement': ['fa-shield'],
        'party': ['fa-users'],
        'exp': ['fa-support'],
        'gold': ['icon-money'],
        'guild': ['fa-network'],
        'combat': ['fa-newspaper-o faa-pulse animated'],
        'event': ['fa-gift faa-shake animated'],
        'pet': ['fa-paw']
      };
      $scope.praying = false;
      $scope.prayText = 'Pray to RNGesus';
      $scope.prayMessages = FunMessages.messages;
      $scope.pray = function() {
        var interval, iters;
        $scope.praying = true;
        $scope.prayText = 'Praying...';
        iters = 0;
        return interval = $interval(function() {
          iters++;
          if (iters === 9) {
            $scope.prayText = Math.random() > 0.5 ? 'Prayer Unheard! :(' : 'RNGesus Listens :)';
          } else {
            $scope.prayText = _.sample($scope.prayMessages);
          }
          if (iters >= 10) {
            $interval.cancel(interval);
            $scope.prayText = 'Pray to RNGesus';
            $scope.praying = false;
          }
        }, 6000);
      };
      $scope.toPetView = function() {
        return $state.go('pet.overview');
      };
      $scope.boughtPets = function() {
        var pets, _ref;
        pets = 0;
        _.each(_.keys((_ref = $scope.player) != null ? _ref.foundPets : void 0), function(petKey) {
          if ($scope.player.foundPets[petKey].purchaseDate) {
            return pets++;
          }
        });
        return pets;
      };
      $scope.clickOnEvent = function(extraData) {
        if (extraData.battleId) {
          return $scope.retrieveBattle(extraData.battleId);
        }
      };
      $scope.retrieveBattle = function(id) {
        return API.battle.get({
          battleId: id
        }).then(function(res) {
          if (!res.data.battle) {
            return;
          }
          CurrentBattle.setBattle(res.data.battle);
          $scope.$parent.$parent.selectedIndex = 3;
          return $timeout(function() {
            return $state.go('player.battle');
          }, 0);
        });
      };
      $scope.loadPersonalities = function() {
        var _ref;
        return _.each((_ref = $scope.player) != null ? _ref.personalityStrings : void 0, function(personality) {
          return $scope.personalityToggle[personality] = true;
        });
      };
      $scope.setPersonality = function(personality, to) {
        var func, key, props;
        func = to ? 'add' : 'remove';
        key = to ? 'newPers' : 'oldPers';
        props = {};
        props[key] = personality;
        return API.personality[func](props);
      };
      $scope.$watchCollection('personalityToggle', function(newVal, oldVal) {
        var propDiff;
        if (initializing || newVal === oldVal) {
          return;
        }
        propDiff = _.omit(newVal, function(v, k) {
          return oldVal[k] === v;
        });
        return _.each(_.keys(propDiff), function(pers) {
          return $scope.setPersonality(pers, propDiff[pers]);
        });
      });
      $scope.initialize = function() {
        initializing = true;
        $scope.player = Player.getPlayer();
        $scope.loadPersonalities();
        return $timeout(function() {
          return initializing = false;
        }, 0);
      };
      Player.observe().then(null, null, function() {
        return $scope.initialize();
      });
      return $scope.initialize();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').controller('PlayerStatistics', [
    '$scope', 'CurrentPlayer', function($scope, Player) {
      $scope.getAllStatisticsInFamily = function(family) {
        var base;
        if (!$scope.player) {
          return;
        }
        base = _.omit($scope.player.statistics, function(value, key) {
          return key.indexOf(family) !== 0;
        });
        return $scope.statisticsKeys[family] = _.keys(base);
      };
      $scope.initialize = function() {
        return _.each(['calculated', 'combat self', 'event', 'explore', 'player'], $scope.getAllStatisticsInFamily);
      };
      Player.observe().then(null, null, function() {
        return $scope.initialize();
      });
      return $scope.initialize();
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').directive('htmldiv', [
    '$compile', '$parse', function($compile, $parse) {
      return {
        restrict: 'E',
        link: function(scope, el, attr) {
          return scope.$watch(attr.content, function() {
            el.html($parse(attr.content)(scope));
            return ($compile(el.contents()))(scope);
          }, true);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').filter('reverse', function() {
    return function(items) {
      return items != null ? items.slice().reverse() : void 0;
    };
  });

}).call(this);

(function() {
  angular.module('IdleLands').directive('statisticsTree', [
    '$parse', '$timeout', function($parse, $timeout) {
      return {
        restrict: 'E',
        templateUrl: 'statistics-template',
        scope: {
          stats: '=',
          root: '=',
          family: '='
        },
        link: function(scope) {
          var stripFamily;
          stripFamily = function(str, family) {
            return (str.substring(family.length)).trim();
          };
          return scope.$watch('stats', function(newVal, oldVal) {
            var sortedStats;
            if (newVal === oldVal) {
              return;
            }
            scope.orderedData = [];
            sortedStats = _.sortBy(scope.stats, function(stat) {
              return stat;
            });
            return _.each(sortedStats, function(stat) {
              var data, sortedKeys, stripName;
              stripName = stripFamily(stat, scope.family);
              if (!stripName) {
                return;
              }
              data = scope.root[stat];
              scope.orderedData.push({
                name: stripName,
                value: (_.isPlainObject(data) ? '' : data),
                alignment: 'left'
              });
              if (_.isPlainObject(data)) {
                sortedKeys = (_.keys(data)).sort();
                return _.each(sortedKeys, function(subkey) {
                  return scope.orderedData.push({
                    name: subkey,
                    value: data[subkey],
                    alignment: 'right'
                  });
                });
              }
            });
          });
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('PetInterceptor', [
    'CurrentPet', function(CurrentPet) {
      return {
        response: function(response) {
          if (response.data.pet) {
            CurrentPet.setPet(response.data.pet);
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('PetsInterceptor', [
    'CurrentPets', function(CurrentPets) {
      return {
        response: function(response) {
          if (response.data.pets) {
            CurrentPets.setPets(response.data.pets);
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('PlayerInterceptor', [
    'CurrentPlayer', function(CurrentPlayer) {
      return {
        request: function(request) {
          var player, _ref;
          if (!request.data) {
            request.data = {};
          }
          player = CurrentPlayer.getPlayer();
          if (((_ref = request.data) != null ? _ref.token : void 0) && player) {
            request.data.identifier = player.identifier;
          }
          return request;
        },
        response: function(response) {
          if (response.data.player) {
            CurrentPlayer.setPlayer(response.data.player);
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('ReloginInterceptor', [
    'CredentialCache', '$injector', function(CredentialCache, $injector) {
      var shouldRelog;
      shouldRelog = function(responseData) {
        return responseData.message === 'Token validation failed.';
      };
      return {
        response: function(response) {
          var creds;
          if (shouldRelog(response.data)) {
            creds = CredentialCache.getCreds();
            if (creds.identifier && creds.password) {
              ($injector.get('API')).auth.login(creds);
            }
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('IdleLands').factory('ToastInterceptor', [
    '$injector', function($injector) {
      var badMessages, canShowMessage;
      badMessages = ['Turn taken.', 'Token validation failed.', 'You can only have one turn every 10 seconds!', 'Map retrieved successfully.'];
      canShowMessage = function(response) {
        var msg;
        msg = response.data.message;
        return (!response.config.data.suppress) && msg && !(__indexOf.call(badMessages, msg) >= 0);
      };
      return {
        response: function(response) {
          if (canShowMessage(response)) {
            ($injector.get('$mdToast')).show({
              template: "<md-toast>" + response.data.message + "</md-toast>"
            });
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('TokenInterceptor', [
    'Token', function(Token) {
      return {
        request: function(config) {
          if (!config.data) {
            config.data = {};
          }
          config.data.token = Token.getToken();
          return config;
        },
        response: function(response) {
          if (response.data.token) {
            Token.setToken(response.data.token);
          }
          return response;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Action', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/action";
      return {
        turn: function(data) {
          return $http.post("" + url + "/turn", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('API', [
    'Authentication', 'Action', 'Battle', 'Personality', 'Pushbullet', 'Strings', 'Gender', 'Inventory', 'Shop', 'Priority', 'Pet', function(Authentication, Action, Battle, Personality, Pushbullet, Strings, Gender, Inventory, Shop, Priority, Pet) {
      return {
        auth: Authentication,
        action: Action,
        battle: Battle,
        personality: Personality,
        priority: Priority,
        pushbullet: Pushbullet,
        strings: Strings,
        gender: Gender,
        inventory: Inventory,
        shop: Shop,
        pet: Pet
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Authentication', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/auth";
      return {
        login: function(data) {
          return $http.post("" + url + "/login", data);
        },
        logout: function(data) {
          return $http.post("" + url + "/logout", data);
        },
        register: function(data) {
          return $http.put("" + url + "/register", data);
        },
        changePassword: function(data) {
          return $http.patch("" + url + "/password", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Battle', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/game/battle";
      return {
        get: function(data) {
          return $http.post("" + url, data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Gender', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/gender";
      return {
        set: function(data) {
          return $http.put("" + url + "/set", data);
        },
        remove: function(data) {
          return $http.post("" + url + "/remove", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Inventory', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/inventory";
      return {
        add: function(data) {
          return $http.put("" + url + "/add", data);
        },
        sell: function(data) {
          return $http.post("" + url + "/sell", data);
        },
        swap: function(data) {
          return $http.patch("" + url + "/swap", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Personality', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/personality";
      return {
        add: function(data) {
          return $http.put("" + url + "/add", data);
        },
        remove: function(data) {
          return $http.post("" + url + "/remove", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Pet', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/pet";
      return {
        buyPet: function(data) {
          return $http.put("" + url + "/buy", data);
        },
        upgradePet: function(data) {
          return $http.post("" + url + "/upgrade", data);
        },
        feedPet: function(data) {
          return $http.put("" + url + "/feed", data);
        },
        takeGold: function(data) {
          return $http.post("" + url + "/takeGold", data);
        },
        changeClass: function(data) {
          return $http.patch("" + url + "/class", data);
        },
        setSmart: function(data) {
          return $http.put("" + url + "/smart", data);
        },
        swapToPet: function(data) {
          return $http.patch("" + url + "/swap", data);
        },
        giveItem: function(data) {
          return $http.put("" + url + "/inventory/give", data);
        },
        takeItem: function(data) {
          return $http.post("" + url + "/inventory/take", data);
        },
        sellItem: function(data) {
          return $http.patch("" + url + "/inventory/sell", data);
        },
        equipItem: function(data) {
          return $http.put("" + url + "/inventory/equip", data);
        },
        unequipItem: function(data) {
          return $http.post("" + url + "/inventory/unequip", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Priority', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/priority";
      return {
        add: function(data) {
          return $http.put("" + url + "/add", data);
        },
        remove: function(data) {
          return $http.post("" + url + "/remove", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Pushbullet', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/pushbullet";
      return {
        set: function(data) {
          return $http.put("" + url + "/set", data);
        },
        remove: function(data) {
          return $http.post("" + url + "/remove", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Shop', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/shop";
      return {
        buy: function(data) {
          return $http.put("" + url + "/buy", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Strings', [
    '$http', 'BaseURL', function($http, baseURL) {
      var url;
      url = "" + baseURL + "/player/manage/string";
      return {
        set: function(data) {
          return $http.put("" + url + "/set", data);
        },
        remove: function(data) {
          return $http.post("" + url + "/remove", data);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('BaseURL', function() {
    return 'https://api.idle.land';
  });

}).call(this);

(function() {
  angular.module('IdleLands').factory('CurrentBattle', [
    function() {
      var battle;
      battle = null;
      return {
        getBattle: function() {
          return battle;
        },
        setBattle: function(newBattle) {
          return battle = newBattle;
        }
      };
    }
  ]);

}).call(this);

(function() {
  var defaultReplaceFunction;

  defaultReplaceFunction = function(fg, bg, fw, td) {
    if (fg == null) {
      fg = '#000';
    }
    if (bg == null) {
      bg = '#fff';
    }
    if (fw == null) {
      fw = 'normal';
    }
    if (td == null) {
      td = 'none';
    }
    return function(msg) {
      return "<span style='color:" + fg + ";background-color:" + bg + ";font-weight:" + fw + ";text-decoration:" + td + "'>" + msg + "</span>";
    };
  };

  angular.module('IdleLands').constant('BattleColorMap', {
    'player.name': defaultReplaceFunction(null, null, 'bold'),
    'event.partyName': defaultReplaceFunction(null, null, null, 'underline'),
    'event.partyMembers': defaultReplaceFunction(null, null, 'bold'),
    'event.player': defaultReplaceFunction(null, null, 'bold'),
    'event.damage': defaultReplaceFunction('#D50000'),
    'event.gold': defaultReplaceFunction('#CDDC39'),
    'event.realGold': defaultReplaceFunction('#CDDC39'),
    'event.shopGold': defaultReplaceFunction('#CDDC39'),
    'event.xp': defaultReplaceFunction('#1B5E20'),
    'event.realXp': defaultReplaceFunction('#1B5E20'),
    'event.percentXp': defaultReplaceFunction('#1B5E20'),
    'event.item.newbie': defaultReplaceFunction('#9E9E9E'),
    'event.item.Normal': defaultReplaceFunction('#9E9E9E'),
    'event.item.basic': defaultReplaceFunction('#2196F3'),
    'event.item.pro': defaultReplaceFunction('#4527A0'),
    'event.item.idle': defaultReplaceFunction('#FF7043'),
    'event.item.godly': defaultReplaceFunction('#fff', '#000'),
    'event.item.custom': defaultReplaceFunction('#fff', '#1A237E'),
    'event.item.guardian': defaultReplaceFunction('#fff', '#006064'),
    'event.finditem.scoreboost': defaultReplaceFunction(),
    'event.finditem.perceived': defaultReplaceFunction(),
    'event.finditem.real': defaultReplaceFunction(),
    'event.blessItem.stat': defaultReplaceFunction(),
    'event.blessItem.value': defaultReplaceFunction(),
    'event.flip.stat': defaultReplaceFunction(),
    'event.flip.value': defaultReplaceFunction(),
    'event.enchant.boost': defaultReplaceFunction(),
    'event.enchant.stat': defaultReplaceFunction(),
    'event.tinker.boost': defaultReplaceFunction(),
    'event.tinker.stat': defaultReplaceFunction(),
    'event.transfer.destination': defaultReplaceFunction(),
    'event.transfer.from': defaultReplaceFunction(),
    'player.class': defaultReplaceFunction(null, null, 'bold'),
    'player.level': defaultReplaceFunction(null, null, 'bold'),
    'stats.hp': defaultReplaceFunction('#B71C1C'),
    'stats.mp': defaultReplaceFunction('#283593'),
    'stats.sp': defaultReplaceFunction('#F57F17'),
    'damage.hp': defaultReplaceFunction('#D50000'),
    'damage.mp': defaultReplaceFunction('#D50000'),
    'spell.turns': defaultReplaceFunction(null, null, 'bold'),
    'spell.spellName': defaultReplaceFunction(null, null, 'bold'),
    'event.casterName': defaultReplaceFunction(null, null, 'bold'),
    'event.spellName': defaultReplaceFunction(null, null, 'bold'),
    'event.targetName': defaultReplaceFunction(null, null, 'bold'),
    'event.achievement': defaultReplaceFunction(null, null, 'bold'),
    'event.guildName': defaultReplaceFunction(null, null, 'bold')
  });

}).call(this);

(function() {
  angular.module('IdleLands').factory('CredentialCache', [
    'localStorageService', 'Token', '$injector', '$q', function(localStorageService, Token, $injector, $q) {
      var cacheCreds, credentials;
      credentials = {};
      cacheCreds = function() {
        localStorageService.set('identifier', credentials.identifier);
        localStorageService.set('name', credentials.name);
        return localStorageService.set('password', credentials.password);
      };
      return {
        doLogout: function() {
          localStorageService.set('identifier', '');
          localStorageService.set('name', '');
          localStorageService.set('password', '');
          Token.setToken('');
          return credentials = {};
        },
        tryLogin: function() {
          var defer, identifier, password;
          defer = $q.defer();
          identifier = localStorageService.get('identifier');
          password = localStorageService.get('password');
          if (!identifier || !password) {
            defer.reject();
          } else {
            credentials = {
              identifier: identifier,
              password: password,
              suppress: true
            };
            ($injector.get('API')).auth.login(credentials).then(function() {
              Token.loadToken();
              return defer.resolve();
            });
          }
          return defer.promise;
        },
        getCreds: function() {
          return credentials;
        },
        setCreds: function(newCreds) {
          credentials = newCreds;
          if (credentials.remember) {
            return cacheCreds();
          }
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('FunMessages', function() {
    return {
      messages: ['Chlorinating Car Pools', 'Partitioning Social Network', 'Prelaminating Drywall Inventory', 'Blurring Reality Lines', 'Reticulating 3-Dimensional Splines', 'Preparing Captive Simulators', 'Capacitating Genetic Modifiers', 'Destabilizing Orbital Payloads', 'Sequencing Cinematic Specifiers', 'Branching Family Trees', 'Manipulating Modal Memory', 'Pressurizing Fruit Punch Barrel Hydraulics', 'Testing Underworld Telecommunications', 'Priming Mascot Mischief Coefficients', 'Caffeinating Student Body', 'Initializing Secret Societies', 'Securing Online Grades Database', 'Reticulating Graduated Splines', 'Requisitioning Alumni Donations', 'Pre-Inking Simoleon Plates', 'Loading School Spirit Algorithm', 'Shampooing Dirty Rugs', 'Restocking Sim Inventories', 'Compositing Vampiric Complexions', 'Replacing Wheel Bearings', 'Re-Re-Re-Re-Re-Reticulating Splines', 'Loading "Vroom" Sounds', 'Turning On Turn-Ons', 'Preparing a Tasty Grilled Cheese Sandwich', 'Infuriating Furious Bits', 'Flavorizing Side-Dishes', 'Disgruntling Employees', 'Managing Managers\' Managers', 'Configuring Lemony Squeezation', 'Preparing Bacon for Homeward Transportation', 'Reticulated Splines for Sale: §2000', 'Mitigating Time-Stream Discontinuities', 'Loading "First Batch" Metrics', 'Initializing Forth-Rallying Protocol', 'Neutralizing Shuriken Oxidization', 'Roof = Roof(1/3*pi*r^2*h)', 'Rasterizing Rodent Residences', 'Limiting Litterbox Loads', 'Scheduling Copious Catnaps', 'Calibrating Canine Customization', 'Dumbing Down Doofuses', 'Scolding Splines for Reticulating', 'Distilling Doggie Dynamics', 'Atomizing Atomic Particles', 'Decrementing Feline Life-Count', 'Dampening Stray Generators', 'Gleefully Stacking Inventories', 'De-chlorophyllizing Leaves', 'Predicting Puddle Prevalence', 'Calculating Snowball Trajectories', 'Unexpectedly Reticulating Splines', 'Assessing Loam Particle Sizes', 'Timing Temperature Transference', 'Individualizing Snowflakes', 'Hydrating Harvestables', 'Stocking Ponds', 'Readying Relaxation Receptors', 'Predicting Pagoda Peaks', 'Originating Ocean Currents', 'Faceting Precious Gems', 'Preparing Vacation Days', 'Spawning Sights to See', 'Reticulating Ninja Splines', 'Analyzing Axe Trajectories', 'Training Tour Guides', 'Initializing Dastardly Schemes', 'Factoring Hobby Enthusiasm', 'Calculating Lifetime Aspirations', 'Predicating Predestined Paths', 'Populating Yards with Bugs and Birds', 'Writing Scrolling Startup String Text', 'Reticulating Splines in the Zone', 'Recruiting Snooty Food Judges', 'Breaking Down Restorable Cars', 'Threading Sewing Needles', 'Lacing Football Cleats', 'Going Apartment Hunting', 'Determining Rent Guidelines', 'Preparing for Pops and Locks', 'Generating Compatible Roommates', 'Twisting Spiral Staircases', 'Telling Splines to Reticulate More Quietly', 'Making a Little Bit of Magic', 'Rasterizing Reputation Algorithms', 'Cluttering Closets', 'Perfecting Playground Pieces', 'Submerging Bedroom Furniture', 'Desalinizing Snorkels', 'Enhancing Crown Reflectivity', 'Crenellating Crenellations', 'Dragon-proofing Dressers', 'Reticulating Underwater Splines', 'Intensifying Hawaiian Prints', 'Navigating Stormy Waters', 'Pre-fluffing Pillows', 'Factoring Fairy Frolicking Frequencies', 'Modeling Marquetry', 'Eschewing Everyday Aesthetics', 'Cultivating Quality and Class', 'Proscribing Plebeian Palates', 'Falsifying Faux Finishes', 'Invigorating Dull Habitations', 'Abolishing Pedestrian Posturing', 'Buffing Splines for Reticulation', 'Appointing Appealing Appurtenances', 'Simulating Sparkling Surfaces', 'Reverse-Engineering Party Scores', 'Unfolding Foldy Chairs', 'Rehearsing Dinner', 'Crash-Proofing Parties', 'Grooming Grooms', 'Mingling', 'De-inviting Don Lothario', 'Borrowing Something Blue', 'Happy 14th Birthday Reticulated Splines!', 'Applying Lampshade Headwear', 'Stocking Clearance Racks', 'Fiercely Reticulating Splines', 'Fashioning Late Arrivals', 'De-wrinkling Worry-Free Clothing', 'Distressing Jeans', 'Developing Delicious Designs', 'Formulating Fitting Rooms', 'Tailoring Trendy Threads', 'Constructing Clothes Hangers', 'Adjusting Acceptable Apparel', 'Capturing Youthful Exuberance', 'Analyzing Adolescent Angst', 'Preparing Personal Spaces', 'Making a Mess', 'Like, Totally Reticulating Splines, Dude', 'Generating Gothic Glamour', 'Monitoring Moody Minors', 'Sweetening Sixteens', 'Teasing Teenage Hair-dos', 'Building Boring Bedrooms? As If!', 'Taking Countertops for Granite', 'Preparing Perfect Plumbing', 'Baking Bread for Toasters', 'Igniting Pilot Lights', 'Putting Down Toilet Seats', 'Remodeling Spline Reticulator', 'Assembling Shower Stalls', 'Examining Tiles from All Zooms and Angles', 'Cooling Down Refrigerators', 'Stocking Stylish Sinks', 'Creating Handmade Lampshades', 'Making Many Mini Wrenches', 'Supplying Self-Serve Furniture Area', 'Simmering Swedish Meatballs', 'Building Bedroom Displays', 'Stress-Testing POÄNG Chairs', 'Some Spline Reticulating Required', 'Upholstering Sofas and Loveseats', 'Boxing BILLY Bookcases', 'Spooling IKEA Awesomenessens', 'Making Manic Mansions', 'Storing Solar Energy', 'Over-Waxing Banisters', 'Stopping To Smell The Flowers', 'Extrapolating Empire Eigenvectors', 'Ceiling Fan Rotation = dL/dT', 'Increasing Water Plant Population', 'Redistributing Resources', 'Reticulating Splines One Last Time', 'Reticulating Story Splines', 'Matching Walls and Floors', 'Partitioning Prose', 'Canceling Un-cancelable Actions', 'Filling in the Blanks', 'Enforcing Storyline', 'Generating Intrigue', 'Launching SimSat 9000', 'Compiling Riley\'s Wardrobe', 'Calculating Vincent\'s Wealth', 'Activating Story Arc', 'Re-Activating Story Arc', 'Leveling Playing Fields', 'Stooping and Scooping', 'Making Pets Look Like Owners', 'Making Owners Look Like Pets', 'Reticulating Dog Show Object Splines', 'Delineating Mask Dynamics', 'Reinforcing Story Lines', 'Decrementing Alice\'s Funds', 'Making Stephen Loyal', 'Calculating Native Restlessness', 'Transmitting Message Bottles', 'Clearing Shipping Lanes', 'Severing Civilization Connections', 'Generating Sand Grains', 'Bribing The Orangutans', 'Wrangling All Wreckage', 'Predicting Weather Unpredictability', 'Estimating Volcanic Activity', 'Amplifying Sun to \'11\'', 'Extruding Mesh Terrain', 'Balancing Domestic Coefficients', 'Inverting Career Ladder', 'Calculating Money Supply', 'Normalizing Social Network', 'Reticulating Even More Splines', 'Adjusting Emotional Weights', 'Calibrating Personality Matrix', 'Inserting Chaos Generator', 'Concatenating Vertex Nodes', 'Balancing Domestic Coefficients', 'Inverting Career Ladder', 'Mapping Influence Attributes', 'Assigning Mimic Propagation', 'Busy Reticulating Splines', 'Iterating Chaos Array', 'Importing Personality Anchors', 'Inserting Extension Algorithms', 'Concatenating Vertex Nodes', 'Balancing Domestic Coefficients', 'Re-Inverting Career Ladder', 'Mapping Influence Attributes', 'Aggregating Need Agents', 'Currently Reticulating Splines', 'Interpreting Family Values', 'Cabalizing NPC Controls', 'Maximizing Social Network', 'Renewing Urban Combinatorics', 'Redefining Family Values', 'Calibrating Personality Matrix', 'Generating Population Model', 'Homogenizing Interest Anatomy', 'Reticulating Splines', 'Establishing Gift Registry', 'Randomizing Inhabitant Characteristics', 'Readjusting Emotional Weights', 'Activating Hotel Staff', 'Importing Entertainment Talent', 'Updating Vacancy Request Hotline', 'Downloading Weather Data', 'Hyperactivating Children', 'Still Reticulating Splines', 'Updating Hotel Registry', 'Calculating Exchange Rate', 'Activating Deviance Threshold', 'Adapting Behavioral Model', 'Reconfiguring Genetic Algorithms', 'Hybridizing Plant Material', 'Reticulating Splines Again', 'Unfolding Helix Packet', 'Synthesizing Natural Selection', 'Enabling Lot Commercialization', 'Recomputing Mammal Matrix', 'Augmenting Occupational Conduits', 'Initializing Operant Construct', 'Generating Schmoozing Algorithm', 'Populating Empyreal Entities', 'Configuring Studio Operations', 'Reticulating Golden Splines', 'Composing Melodic Euphony', 'Spreading Rumors', 'Polarizing Image Conduits', 'Calibrating Fame Indicant', 'Strengthening Award Foundations', 'Abstracting Loading Procedures', 'Locating Misplaced Calculations', 'Eliminating Would-be Chicanery', 'Tabulating Spell Effectors', 'Reticulating Unreticulated Splines', 'Recycling Hex Decimals', 'Binding Trace Enchantments', 'Fabricating Imaginary Infrastructure', 'Optimizing Baking Temperature', 'Ensuring Transplanar Synergy', 'Simulating Program Execution', 'Reticulating More Splines', 'Interpreting Family Values', 'Fabricating Imaginary Infrastructure', 'Recomputing Mammal Matrix', 'Activating Deviance Threshold', 'Composing Melodic Euphony', 'Homogenizing Interest Anatomy', 'Normalizing Social Network', 'Compiling Reticulated Splines', 'Simulating Program Execution', 'Shooting Stars', 'Maximizing Fun', 'Tasting The Rainbow', 'Downloading Awesomesauce', 'Being Awesome', 'Generating Llamas', 'Herding Goats', 'Goats Goats Goats', 'Up To No Good', 'Calculating Odds', 'Keeping Calm', 'Keeping (Mostly) Calm', 'Stretching The Truth', 'Going Somewhere']
    };
  });

}).call(this);

(function() {
  angular.module('IdleLands').factory('ItemUtilities', function() {
    var equipmentStatArray, extendedEquipmentStatArray;
    equipmentStatArray = [
      {
        name: 'str',
        fa: 'fa-legal fa-rotate-90'
      }, {
        name: 'dex',
        fa: 'fa-crosshairs'
      }, {
        name: 'agi',
        fa: 'fa-bicycle'
      }, {
        name: 'con',
        fa: 'fa-heart'
      }, {
        name: 'int',
        fa: 'fa-mortar-board'
      }, {
        name: 'wis',
        fa: 'fa-book'
      }, {
        name: 'luck',
        fa: 'fa-moon-o'
      }, {
        name: 'fire',
        fa: 'fa-fire'
      }, {
        name: 'water',
        fa: 'icon-water'
      }, {
        name: 'thunder',
        fa: 'fa-bolt'
      }, {
        name: 'earth',
        fa: 'fa-leaf'
      }, {
        name: 'ice',
        fa: 'icon-snow'
      }
    ];
    extendedEquipmentStatArray = equipmentStatArray.concat({
      name: 'sentimentality'
    }, {
      name: 'piety'
    }, {
      name: 'enchantLevel'
    }, {
      name: 'shopSlot'
    }, {
      name: 'overflowSlot'
    }, {
      name: 'uid'
    }, {
      name: '_calcScore'
    }, {
      name: '_baseScore'
    });
    return {
      equipmentStatArray: equipmentStatArray,
      extendedEquipmentStatArray: extendedEquipmentStatArray,
      classToColor: function(itemClass) {
        switch (itemClass) {
          case 'newbie':
            return 'bg-maroon';
          case 'basic':
            return 'bg-gray';
          case 'pro':
            return 'bg-purple';
          case 'idle':
            return 'bg-rainbow';
          case 'godly':
            return 'bg-black';
          case 'custom':
            return 'bg-blue';
          case 'guardian':
            return 'bg-cyan';
          case 'extra':
            return 'bg-orange';
          case 'total':
            return 'bg-teal';
          case 'shop':
            return 'bg-darkblue';
        }
      },
      getExtraStats: function(item) {
        var keys;
        keys = _.filter(_.compact(_.keys(item)), function(key) {
          return _.isNumber(item[key]);
        });
        _.each(extendedEquipmentStatArray, function(stat) {
          keys = _.without(keys, stat.name);
          return keys = _.without(keys, "" + stat.name + "Percent");
        });
        keys = _.reject(keys, function(key) {
          return item[key] === 0;
        });
        return _.map(keys, function(key) {
          return "" + key + " (" + item[key] + ")";
        }).join(', ');
      }
    };
  });

}).call(this);

(function() {
  angular.module('IdleLands').factory('CurrentMap', [
    'CurrentPlayer', '$q', '$http', 'BaseURL', function(Player, $q, $http, baseURL) {
      var defer, map, mapName, setMap;
      map = null;
      mapName = null;
      defer = $q.defer();
      setMap = function(newMap) {
        map = newMap;
        return defer.notify(map);
      };
      Player.observe().then(null, null, function(player) {
        if (player.map === mapName) {
          return;
        }
        mapName = player.map;
        return $http.post("" + baseURL + "/game/map", {
          map: player.map
        }).then(function(res) {
          return setMap(res.data.map);
        });
      });
      return {
        getMap: function() {
          return map;
        },
        observe: function() {
          return defer.promise;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('OptionsCache', [
    'localStorageService', function(localStorageService) {
      var getOpts, load, options, saveAll, set;
      options = {};
      load = function(keys) {
        return _.each(keys, function(key) {
          return options[key] = localStorageService.get(key);
        });
      };
      saveAll = function() {
        return _.each(_.keys(options), function(option) {
          return localStorageService.set(option, options[option]);
        });
      };
      set = function(key, val) {
        options[key] = val;
        return localStorageService.set(key, val);
      };
      getOpts = function() {
        return options;
      };
      return {
        load: load,
        saveAll: saveAll,
        set: set,
        getOpts: getOpts
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('CurrentPet', [
    '$q', function($q) {
      var defer, pet;
      pet = null;
      defer = $q.defer();
      return {
        observe: function() {
          return defer.promise;
        },
        getPet: function() {
          return pet;
        },
        setPet: function(newPet) {
          pet = newPet;
          return defer.notify(pet);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('CurrentPets', [
    '$q', function($q) {
      var defer, pets;
      pets = null;
      defer = $q.defer();
      return {
        observe: function() {
          return defer.promise;
        },
        getPets: function() {
          return pets;
        },
        setPets: function(newPets) {
          pets = newPets;
          return defer.notify(pets);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('CurrentPlayer', [
    '$q', function($q) {
      var defer, player;
      player = null;
      defer = $q.defer();
      return {
        observe: function() {
          return defer.promise;
        },
        getPlayer: function() {
          return player;
        },
        setPlayer: function(newPlayer) {
          player = newPlayer;
          return defer.notify(player);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('Token', [
    'localStorageService', function(localStorageService) {
      var token;
      token = null;
      return {
        loadToken: function() {
          if (token) {
            return;
          }
          return token = localStorageService.get('token');
        },
        getToken: function() {
          return token;
        },
        setToken: function(newToken) {
          token = newToken;
          return localStorageService.set('token', token);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('IdleLands').factory('TurnTaker', [
    '$interval', '$q', 'API', function($interval, $q, API) {
      var defer, seconds, setSeconds, timeInterval, turnInterval;
      seconds = 0;
      turnInterval = null;
      timeInterval = null;
      defer = $q.defer();
      setSeconds = function(newVal) {
        seconds = newVal;
        return defer.notify(seconds);
      };
      return {
        beginTakingTurns: function(player) {
          if (!player) {
            $interval.cancel(turnInterval);
            $interval.cancel(timeInterval);
            return;
          }
          if (turnInterval) {
            return;
          }
          API.action.turn({
            identifier: player.identifier
          });
          setSeconds(0);
          timeInterval = $interval(function() {
            return setSeconds(seconds + 1);
          }, 1000);
          return turnInterval = $interval(function() {
            setSeconds(0);
            return API.action.turn({
              identifier: player.identifier
            });
          }, 10100);
        },
        getSeconds: function() {
          return seconds;
        },
        observe: function() {
          return defer.promise;
        }
      };
    }
  ]);

}).call(this);
