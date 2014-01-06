module.exports = (grunt) ->
  'use strict'

  require('load-grunt-tasks')(grunt)
    
  grunt.initConfig
    jshint:
      options:
        camelcase: true
        trailing: true
        #indent: 2
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
          compress:
            global_defs:
              DEBUG: false
            dead_code: true
        src: ['scrollsmartly.js']
        dest: 'scrollsmartly.min.js'

    watch:
      concat_dist:
        files: 'scrollsmartly.js'
        tasks: ['jshint', 'uglify']
        
  defaultTasks = [
    'jshint'
    'uglify'
    'watch'
  ]
  
  grunt.registerTask 'default', defaultTasks
    