angular.module 'IdleLands'
.controller 'PetOverview', [
  '$scope', '$timeout', '$mdDialog', 'CurrentPet', 'CurrentPets', 'CurrentPlayer', 'API', '$state',
  ($scope, $timeout, $mdDialog, Pet, Pets, Player, API, $state) ->

    initializing = yes

    $scope.equipmentStatArray = [
      {name: 'str', fa: 'fa-legal fa-rotate-90'}
      {name: 'dex', fa: 'fa-crosshairs'}
      {name: 'agi', fa: 'fa-bicycle'}
      {name: 'con', fa: 'fa-heart'}
      {name: 'int', fa: 'fa-mortar-board'}
      {name: 'wis', fa: 'fa-book'}
      {name: 'luck', fa: 'fa-moon-o'}
      {name: 'fire', fa: 'fa-fire'}
      {name: 'water', fa: 'icon-water'}
      {name: 'thunder', fa: 'fa-bolt'}
      {name: 'earth', fa: 'fa-leaf'}
      {name: 'ice', fa: 'icon-snow'}
    ]

    $scope.pets = []

    $scope.toPlayerView = ->
      $state.go 'player.overview'

    $scope.boughtPets = ->
      pets = 0
      _.each (_.keys $scope.player.foundPets), (petKey) ->
        pets++ if $scope.player.foundPets[petKey].purchaseDate

      pets

    $scope.availablePets = ->
      pets = []

      _.each (_.keys $scope.player?.foundPets), (petKey) ->
        pet = $scope.player.foundPets[petKey]
        return if pet.purchaseDate
        pet.type = petKey
        pets.push pet

      pets

    $scope.tryToBuyPet = (pet) ->
      return if not $scope.canBuyPet pet
      $mdDialog.show
        templateUrl: 'buy-pet'
        controller: 'PetBuy'
        locals:
          petType: pet.type

    $scope.canBuyPet = (pet) ->
      pet.cost <= $scope.player.gold.__current

    $scope.$watch (-> Pet.getPet()), (newVal, oldVal) ->
      return if newVal is oldVal and (not newVal or not oldVal)

      initializing = yes

      $scope.pet = newVal

      $timeout ->
        initializing = no
      , 0

    $scope.$watch (-> Player.getPlayer()), (newVal, oldVal) ->
      return if newVal is oldVal
      $scope.player = newVal

    $scope.$watch (-> Pets.getPets()), (newVal, oldVal) ->
      return if newVal is oldVal
      $scope.pets = newVal
]

angular.module 'IdleLands'
.controller 'PetBuy', [
  '$scope', '$mdDialog', 'petType', 'API'
  ($scope, $mdDialog, petType, API) ->

    $scope.newPet =
      name: ''
      attr1: 'a monocle'
      attr2: 'a top hat'

    $scope.petType = petType

    $scope.cancel = $mdDialog.hide

    $scope.purchase = ->
      petAttrs =
        type: petType
        attrs: [$scope.newPet.attr1, $scope.newPet.attr2]
        name: $scope.newPet.name

      API.pet.buyPet petAttrs
      .then (res) ->
        console.log res
        return if not res.isSuccess

        $mdDialog.hide()
]