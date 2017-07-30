var fs = require('fs')
var exec = require('child_process').exec
var async = require('async')

var Hook = (function () {
  var _Hook = function (options) {
    var defaultOptions = {
      dir: '',
      token: ''
    }
    _copyOptions(this, options, defaultOptions)
    _getRemotes(this.dir, this)
    _getBranchs(this.dir, this)
  }

  _Hook.prototype.pull = function (data, callback) {
    var token = data.token
    var isPass = this.checkToken(token)
    if (!isPass) {
      return callback()
    }
    var https_remote = data.ssh_url
    var ssh_remote = data.https_url
    var remoteName = ''
    var ref = data.ref
    for (var key in this.remotes) {
      if (this.remotes[key] === ssh_remote) {
        remoteName = key
        break
      }
      if (this.remotes[key] === https_remote) {
        remoteName = key
        break
      }
    }
    if (!remoteName || ref != this.currentBranch) {
      return callback()
    }
    var command = 'git pull ' + remoteName + ' ' + this.currentBranch
    exec(command, {
      cwd: this.dir
    }, callback)
  }

  _Hook.prototype.checkToken = function (token) {
    if (token === this.token) {
      return true
    }
  }

  var _copyOptions = function (target, copy, defaultOptions) {
    for (var key in defaultOptions) {
      target[key] = copy[key] || defaultOptions[key]
    }
  }

  var _getRemotes = function (dir, obj) {
    obj.remotes = {}
    async.waterfall([
      function (next) {
        fs.access(dir, next)
      },
      function (next) {
        exec('git remote', {
          cwd: dir
        }, next)
      },
      function (stdout, stderr, next) {
        var remotes = stdout.match(/\w+/g)
        async.each(remotes, function (item, next2) {
          var command = 'git remote get-url ' + item
          exec(command, {
            cwd: dir
          }, function (err, stdout, stderr) {
            if (err) {
              next2(err)
            }
            obj.remotes[item] = stdout.replace('\n', '')
            next2()
          })
        }, next)
      }
    ], function (err, result) {
      if (err) {
        var message = 'getRepository in ' + dir + ' Error!\n' + err
        throw new Error(message)
      }
    })
  }

  var _getBranchs = function (dir, obj) {
    obj.branchs = {}
    async.waterfall([
      function (next) {
        fs.access(dir, next)
      },
      function (next) {
        var command = 'git branch'
        exec(command, {
          cwd: dir
        }, next)
      }
    ], function (err, stdout, stderr) {
      if (err) {
        var message = 'getBranchs in ' + dir + ' Error\n' + err
        throw new Error(message)
      }
      var branchs = stdout.match(/\*? \w+/g)
      if (!branchs) {
        return
      }
      branchs.forEach(function(item) {
        if (~item.indexOf('*')) {
          item = item.replace('* ', '')
          obj.branchs[item] = true
          obj.currentBranch = item
        } else {
          item = item.replace(/^\s+/, '')
          obj.branchs[item] = false
        }
      })
    })
  }

  return _Hook
})()

module.exports = Hook