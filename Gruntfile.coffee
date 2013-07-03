module.exports = (grunt)->
  devDep = grunt.file.readJSON('package.json').devDependencies

  for taskName, version of devDep
    if 'grunt-' is taskName.substring 0, 6
      grunt.loadNpmTasks taskName
      
  grunt.initConfig
    compass:
      dev:
        options:
          sassDir: 'scss'
          cssDir: 'scss/build-dev'
          environment: 'development'
          outputStyle: 'expanded'
      dist:
        options:
          sassDir: 'scss'
          cssDir: 'css'
          environment: 'production'
          outputStyle: 'compressed'
    
    coffee:
      main:
        options:
          sourceMap: true
        files:
          'jsdev/main/main.js': ['jsdev/*.coffee']
          
    concat:
      main:
        src: ['jsdev/main/*.js']
        dest: 'js/script.js'

    csslint:
      lax:
        options:
          import: false
          ids: false
        src: ['scss/build-dev/*.css']
    
    watch:
      options:
        # http://feedback.livereload.com/knowledgebase/articles/86242
        # if you want to use it with local files,
        # be sure to enable “Allow access to file URLs” checkbox
        # in Tools > Extensions > LiveReload after installation.
        livereload: true
      compass:
        files: ['scss/*.scss']
        tasks: ['compass']
      coffee:
        files: ['jsdev/*.coffee']
        tasks: ['coffee']
      concat:
        files: ['jsdev/main/*.js']
        tasks: ['concat']
      html:
        files: ['index.html']

  grunt.task.registerTask 'default', [
    'compass', 'coffee', 'concat'
    'watch'
  ]
