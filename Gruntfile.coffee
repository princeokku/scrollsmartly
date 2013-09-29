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
    testem:
      main:
        src: 'testem.json'
        dest: 'tests.tap'
        
    uglify:
      dist:
        options:
          preserveComments: 'true'
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
      options:
        # http://feedback.livereload.com/knowledgebase/articles/86242
        # if you want to use it with local files,
        # be sure to enable “Allow access to file URLs” checkbox
        # in Tools > Extensions > LiveReload after installation.
        livereload: true
      concat_dist:
        files: ["#{ DEST_ROOT }js/debug/*.js"]
        tasks: ['concat:dist', 'clean:tmpfiles']
        
    concurrent:
      beginning: ['flexSVG', 'shell:coffeelint_grunt', 'shell:coffeelint']
      dev: ['compass:dev', 'coffee:dev', 'jadeTemplate:dev']
  
  defaultTasks = [
    'clean:site' #reset
    'concurrent:beginning'
    'concurrent:dev', 'concurrent:dist'
    'uglify'
    'connect', 'watch'
  ]
  
  grunt.task.registerTask 'default', defaultTasks
    