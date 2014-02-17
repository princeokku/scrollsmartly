module.exports = (grunt) ->
  'use strict'

  require('load-grunt-tasks') grunt
    
  grunt.initConfig
    replace:
      bump:
        options:
          prefix: ' v'
          preservePrefix: true
          patterns: []
        files:
          'scrollsmartly.js': ['scrollsmartly.js']
    
    jshint:
      options:
        camelcase: true
        trailing: true
      main: 'scrollsmartly.js'
      
    testem:
      main:
        src: 'testem.json'
        dest: 'tests.tap'
    
    complexity:
      generic:
        src: ['scrollsmartly.js']
        options:
          errorsOnly: false
          cyclomatic: 3
          halstead: 8
          maintainability: 100
    
    uglify:
      dist:
        options:
          preserveComments: 'some'
        src: ['scrollsmartly.js']
        dest: 'scrollsmartly.min.js'
    
    watch:
      concat_dist:
        files: 'scrollsmartly.js'
        tasks: ['jshint', 'uglify']
    
    release:
      options:
        file: 'bower.json'
        npm: false
    
  grunt.registerTask 'build', ['jshint', 'uglify']
  grunt.registerTask 'default', ['build', 'watch']
    
  grunt.registerTask 'publish', ->
    releaseType = this.args[0]
    currentVer = grunt.file.readJSON('bower.json').version
    nextVer = require('semver').inc currentVer, this.args[0]
    if not nextVer
      return
    grunt.config 'replace.bump.options.patterns', [
      match: currentVer
      replacement: nextVer
    ]
    
    grunt.task.run ['replace', 'build' ,"release:#{ releaseType }"]
