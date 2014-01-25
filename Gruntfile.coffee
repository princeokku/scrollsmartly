module.exports = (grunt) ->
  'use strict'

  require('load-grunt-tasks')(grunt)
    
  grunt.initConfig
    replace: {} # tmp
    
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
        
  grunt.registerTask 'default', [
    'jshint'
    'uglify'
    'watch'
  ]
