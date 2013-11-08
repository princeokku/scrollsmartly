module.exports = (grunt) ->
  devDeps = grunt.file.readJSON('package.json').devDependencies

  for taskName of devDeps
    if 'grunt-' is taskName.substring 0, 6
      grunt.loadNpmTasks taskName
  
  _ = grunt.util._
  
  BIN = "#{ process.cwd() }/node_modules/.bin/"

  SRC_ROOT = ''
  DEST_ROOT = 'site/'
  
  grunt.initConfig
    jshint:
      main: 'scrollsmartly.js'
      
    testem:
      main:
        src: 'testem.json'
        dest: 'tests.tap'
    
    uglify:
      dist:
        options:
          preserveComments: 'some'
          compress:
            global_defs:
              DEBUG: false
            dead_code: true
        src: 'scrollsmartly.js'
        dest: 'scrollsmartly.min.js'

    open:
      site:
        path: 'http://127.0.0.1:7357/'
        app: 'Google Chrome'
    
    watch:
      concat_dist:
        files: 'scrollsmartly.js'
        tasks: ['jshint', 'uglify']
        
  defaultTasks = [
    'jshint'
    'uglify'
    'watch'
  ]
  
  grunt.task.registerTask 'default', defaultTasks
    