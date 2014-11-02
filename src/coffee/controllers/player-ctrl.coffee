angular.module 'IdleLands'
.controller 'Player', [
  '$scope', '$state', '$window', '$timeout', '$mdToast', 'API', 'Player', 'TurnTaker' ,'CredentialCache', 'OptionsCache',
  ($scope, $state, $window, $timeout, $mdToast, API, Player, TurnTaker, CredentialCache, OptionsCache) ->

    if not Player.getPlayer()
      CredentialCache.tryLogin().then (->
        if not Player.getPlayer()
          $mdToast.show template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
          $state.go 'login'

        else
          TurnTaker.beginTakingTurns Player.getPlayer()
        ),
        (->
          $mdToast.show template: "<md-toast>You don't appear to be logged in! Redirecting you to the login page...</md-toast>"
          $state.go 'login'
        )

    OptionsCache.load ['scrollback']
    $scope.options = OptionsCache.getOpts()

    $scope.personalityToggle = {}
    $scope.strings =
      keys: []
      values: []
    $scope._player = Player
    $scope.xpPercent = 0
    $scope.selectedIndex = 0
    $scope.statisticsKeys = {}
    $scope._ = $window._

    $scope.selectTab = (tabIndex) ->
      $scope.selectedIndex = tabIndex

    $scope.calcXpPercent = ->
      $scope.xpPercent = ($scope.player.xp.__current / $scope.player.xp.maximum)*100

    $scope.sortPlayerItems = ->
      $scope.playerItems = (_.sortBy ($scope.getEquipmentAndTotals $scope.player.equipment), (item) -> item.type).concat $scope.getOverflows()

    initializing = yes

    $scope.loadPersonalities = ->
      _.each $scope.player.personalityStrings, (personality) ->
        $scope.personalityToggle[personality] = yes

    $scope.setPersonality = (personality, to) ->
      func = if to then 'add' else 'remove'
      key = if to then 'newPers' else 'oldPers'

      props = {}
      props[key] = personality

      API.personality[func] props

    $scope.classToColor = (itemClass) ->
      switch itemClass
        when 'newbie' then return 'bg-maroon'
        when 'basic'  then return 'bg-gray'
        when 'pro'    then return 'bg-purple'
        when 'idle'   then return 'bg-rainbow'
        when 'godly'  then return 'bg-black'
        when 'custom' then return 'bg-blue'
        when 'extra'  then return 'bg-orange'
        when 'total'  then return 'bg-teal'

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

    $scope.eventTypeToIcon =
      'item-mod': ['fa-legal','fa-magic fa-rotate-90']
      'item-find': ['icon-feather']
      'item-enchant': ['fa-magic']
      'item-switcheroo': ['icon-magnet']
      'profession': ['fa-child']
      'explore': ['fa-globe']
      'levelup': ['icon-universal-access']
      'achievement': ['fa-shield']
      'party': ['fa-users']
      'exp': ['fa-support']
      'gold': ['icon-money']
      'guild': ['fa-network']

    $scope.achievementTypeToIcon =
      'class': ['fa-child']
      'event': ['fa-info']
      'combat': ['fa-legal','fa-magic fa-rotate-90']
      'special': ['fa-gift']
      'personality': ['fa-group']
      'exploration': ['fa-compass']
      'progress': ['fa-signal']

    $scope.extendedEquipmentStatArray = $scope.equipmentStatArray.concat {name: 'sentimentality'},
      {name: 'piety'},
      {name: 'enchantLevel'},
      {name: '_calcScore'},
      {name: '_baseScore'}

    $scope.getExtraStats = (item) ->
      keys = _.filter (_.compact _.keys item), (key) -> _.isNumber item[key]

      _.each $scope.extendedEquipmentStatArray, (stat) ->
        keys = _.without keys, stat.name
        keys = _.without keys, "#{stat.name}Percent"

      keys = _.reject keys, (key) -> item[key] is 0

      _.map keys, (key) -> "#{key} (#{item[key]})"
      .join ', '

    $scope.getEquipmentAndTotals = (items) ->

      test = _.reduce items, (prev, cur) ->
        for key, val of cur
          prev[key] = 0 if not (key of prev) and _.isNumber val
          prev[key] += val if _.isNumber val
        prev
      , {name: 'Equipment Stat Totals', type: 'TOTAL', itemClass: 'total'}

      items.unshift test

      items

    $scope.getOverflows = ->

      items = []
      overflow = $scope.player.overflow

      if overflow
        _.each overflow, (item, index) ->
          item.extraItemClass = 'extra'
          item.extraText = "SLOT #{index}"
          items.push item

      items

    $scope.logout = ->
      Player.setPlayer null
      CredentialCache.doLogout()
      API.auth.logout()
      $state.go 'login'

    $scope.valueToColor = (value) ->
      return 'text-red' if value < 0
      return 'text-green' if value > 0

    $scope.itemItemScore = (item) ->
      return 0 if not item._baseScore or not item._calcScore
      parseInt (item._calcScore / item._baseScore) * 100

    $scope.playerItemScore = (item) ->
      return 0 if not item._calcScore or not $scope.player._baseStats.itemFindRange
      parseInt (item._calcScore / $scope.player._baseStats.itemFindRange) * 100

    $scope.buildStringList = ->
      $scope.strings.keys = _.keys $scope.player.messages
      $scope.strings.values = _.values $scope.player.messages
      $scope.strings.keys.push ''

    $scope.updateStrings = ->
      oldVal = $scope.player.messages or {}
      newVal = _.zipObject $scope.strings.keys, $scope.strings.values

      propDiff = _.omit newVal, (v,k) -> oldVal[k] is v

      return if _.isEmpty propDiff
      $scope.player.messages = newVal

      _.each (_.keys propDiff), (key) ->
        API.strings.set {type: key, msg: propDiff[key]}

      $scope.buildStringList()

    $scope.removeString = (key, index) ->
      API.strings.remove {type: key}
      .then ->
        $scope.strings.keys = _.reject $scope.strings.keys, (key, kI) -> index is kI
        $scope.strings.values = _.reject $scope.strings.values, (key, kI) -> index is kI
        $scope.player.messages = _.omit $scope.player.messages, key

        $scope.buildStringList()

    $scope.getAllStatisticsInFamily = (family) ->
      return if not $scope.player
      base = _.omit $scope.player.statistics, (value, key) ->
        key.indexOf(family) isnt 0

      $scope.statisticsKeys[family] = _.keys base

    $scope.handleScrollback = ->
      classFunc = if $scope.options.scrollback is 'true' then 'removeClass' else 'addClass'
      scrollback = (angular.element '.scrollback-toast')[classFunc] 'hidden'

    $timeout $scope.handleScrollback, 3000

    # watches
    $scope.$watch 'strings', (newVal, oldVal) ->
      return if newVal is oldVal
      $scope.updateStrings()
    , yes

    $scope.$watchCollection 'personalityToggle', (newVal, oldVal) ->
      return if initializing or newVal is oldVal or _.isEmpty oldVal

      propDiff = _.omit newVal, (v,k) -> oldVal[k] is v

      _.each (_.keys propDiff), (pers) ->
        $scope.setPersonality pers, propDiff[pers]

    $scope.$watch 'options', (newVal, oldVal) ->
      return if newVal is oldVal
      OptionsCache.saveAll()
      $scope.handleScrollback()
    , yes

    $scope.$watch 'player.pushbulletApiKey', (newVal, oldVal) ->
      return if newVal is oldVal or initializing
      API.pushbullet.set {apiKey: newVal}

    $scope.$watch '_player.getPlayer()', (newVal, oldVal) ->
      return if newVal is oldVal

      initializing = yes

      $scope.player = newVal
      $window.scrollback.nick = newVal.name
      $scope.calcXpPercent()
      $scope.sortPlayerItems()
      $scope.loadPersonalities()
      $scope.buildStringList()

      _.each ['calculated', 'combat self', 'event', 'explore', 'player'], $scope.getAllStatisticsInFamily

      initializing = no

]