angular.module 'IdleLands'
.controller 'PlayerOptions', [
  '$scope', '$timeout', 'CurrentPlayer', 'OptionsCache', 'API'
  ($scope, $timeout, Player, OptionsCache, API) ->

    initializing = yes

    $scope.options = OptionsCache.getOpts()

    $scope.strings =
      keys: []
      values: []

    # custom strings
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

    $scope.$watch 'strings', (newVal, oldVal) ->
      return if newVal is oldVal
      $scope.updateStrings()
    , yes

    $scope.$watch 'player.pushbulletApiKey', (newVal, oldVal) ->
      return if newVal is oldVal or initializing
      API.pushbullet.set {apiKey: newVal}

    $scope.$watch 'player.gender', (newVal, oldVal) ->
      return if newVal is oldVal or initializing
      API.gender.set {gender: newVal}

    isChanging = no
    $scope.$watch 'player.priorityPoints', (newVal, oldVal) ->
      return if newVal is oldVal or not oldVal

      propDiff = _.omit newVal, (v,k) -> oldVal[k] is v

      return if _.isEmpty propDiff

      _.each (_.keys propDiff), (prop) ->
        if $scope.player.priorityPoints[prop] < 0
          isChanging = yes
          $scope.player.priorityPoints[prop] = 0
          $timeout ->
            isChanging = no
          , 0
          return

        return if isChanging

        propDiff[prop] = newVal[prop] - oldVal[prop]

        return if (Math.abs propDiff[prop]) isnt 1

        isChanging = yes
        API.priority.add {stat: prop, points: propDiff[prop]}
        .then (res) ->
          if res.data.isSuccess
            isChanging = no
            return
          $scope.player.priorityPoints[prop] -= propDiff[prop]

          $timeout ->
            isChanging = no
          , 0
    , yes

    $scope.$watch (-> Player.getPlayer()), (newVal, oldVal) ->
      return if newVal is oldVal and (not newVal or not oldVal)

      initializing = yes

      $scope.player = newVal
      $scope.buildStringList()

      $timeout ->
        initializing = no
      , 0

]