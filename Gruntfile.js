'use strict';

module.exports = function (grunt) {

  //////////////////////////////
  // Import Grunt Configuration
  //
  // Combine with System options
  //////////////////////////////
  var deepmerge = require('deepmerge');
  var userConfig = grunt.file.readYAML('config.yml');
  userConfig = deepmerge(userConfig, grunt.file.readJSON('.system.json'));
  userConfig = deepmerge(userConfig, grunt.file.readJSON('.extension.json'));

  grunt.userConfig = userConfig;

  // Asset Paths
  var imagesDir = userConfig.assets.imagesDir;
  var cssDir = userConfig.assets.cssDir;
  var sassDir = userConfig.assets.sassDir;
  var jsDir = userConfig.assets.jsDir;
  var fontsDir = userConfig.assets.fontsDir;
  var componentsDir = userConfig.assets.componentsDir;

  // Generator Configuration
  var pagesDir = userConfig.generator.pagesDir;
  var templatesDir = userConfig.generator.templatesDir;
  var partialsDir = userConfig.generator.partialsDir;

  var helpers = userConfig.generator.helpers;
  helpers = require('./' + helpers);

  // Server Configuration
  var port = userConfig.server.port;
  var lrport = userConfig.server.port + 1;
  var root = userConfig.server.root;

  // Compass Configuration
  var debugInfo = userConfig.compass.debugInfo;
  var extensions = userConfig.compass.extensions;

  // Export Configuration
  var distPath = userConfig.export.distPath;
  var exportPath = userConfig.export.path;
  var assetPrefix = userConfig.export.assetPrefix;

  // Github Configuration
  var gh_commit = userConfig.git.defaultCommit;
  var gh_upstream = userConfig.git.deployUpstream;
  var gh_deploy = userConfig.git.deployBranch;
  
  //////////////////////////////
  //Grunt Config
  //////////////////////////////
  grunt.initConfig({
    // Development Server
    connect: {
      server: {
        options: {
          port: port,
          base: root
        }
      }
    },

    // Watch Task
    watch: {
      options: {
        livereload: lrport
      },
      html: {
        files: [
          pagesDir + '/{,**/}*.html',
          pagesDir + '/{,**/}*.md',
          partialsDir + '/{,**/}*.html',
          templatesDir + '/{,**/}*.html'
        ],
        tasks: ['generator:dev']
      },
      js: {
        files: [
          jsDir + '/{,**/}*.js',
          '!' + jsDir + '/{,**/}*.min.js'
        ],
        tasks: ['jshint', 'uglify:dev']
      },
      images: {
        files: [imagesDir + '/**/*'],
        tasks: ['copy:dev']
      },
      fonts: {
        files: [fontsDir + '/**/*'],
        tasks: ['copy:dev']
      },
      sass: {
        files: [sassDir + '/{,**/}*.scss'],
        tasks: ['compass:dev'],
        options: {
          livereload: false
        }
      },
      css: {
        files: [root + '/' + cssDir + '/{,**/}*.css'],
        tasks: ['csslint']
      },
      config: {
        files: [
          'config.yml',
          '.system.yml'
        ],
        tasks: ['generator:dev']
      }
    },

    // Generator Task
    generator: {
      dev: {
        files: [{
          cwd: pagesDir,
          src: ['**/*'],
          dest: root,
          ext: '.html'
        }],
        options: {
          partialsGlob: [partialsDir + '/{,**/}*.html', partialsDir + '/{,**/}*.md'],
          templates: templatesDir,
          handlebarsHelpers: helpers,
          userConfig: userConfig,
          environment: 'dev',
          development: true,
          lrport: lrport,
          assets: ''
        }
      },
      dist: {
        files: [{
          cwd: pagesDir,
          src: ['**/*'],
          dest: distPath,
          ext: '.html'
        }],
        options: {
          partialsGlob: partialsDir + '/*.html',
          templates: templatesDir,
          handlebarsHelpers: helpers,
          userConfig: userConfig,
          environment: 'prod',
          development: false,
          assets: '/' + assetPrefix

        }
      }
    },

    // Compass Task
    compass: {
      options: {
        sassDir: sassDir,
        require: extensions,
        relativeAssets: true,
        importPath: componentsDir,
        debugInfo: debugInfo,
        bundleExec: true
      },
      dev: {
        options: {
          imagesDir: root + '/' + imagesDir,
          cssDir: root + '/' + cssDir,
          javascriptsDir: root + '/' + jsDir,
          fontsDir: root + '/' + fontsDir,
          environment: 'development'
        }
      },
      dist: {
        options: {
          imagesDir: distPath + '/' + imagesDir,
          cssDir: distPath + '/' + cssDir,
          javascriptsDir: distPath + '/' + jsDir,
          fontsDir: distPath + '/' + fontsDir,
          environment: 'production',
          force: true
        }
      }
    },

    // JSHint Task
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        jsDir + '/{,**/}*.js',
        '!' + jsDir + '/{,**/}*.min.js'
      ]
    },

    // CSS Lint
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: [
        root + '/' + cssDir + '/{,**/}*.css'
      ]
    },

    // Image Min Task
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          cwd: imagesDir,
          src: ['**/*.png', '**/*.jpg'],
          dest: distPath + '/' + imagesDir
        }]
      }
    },

    // SVG Min Task
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: imagesDir,
          src: '**/*.svg',
          dest: distPath + '/' + imagesDir
        }]
      }
    },

    // Uglify Task
    uglify: {
      dev: {
        options: {
          mangle: false,
          compress: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: jsDir,
          src: ['**/*.js', '!**/*.min.js'],
          dest: root + '/' + jsDir,
          ext: '.js'
        }]
      },
      dist: {
        options: {
          mangle: true,
          compress: true
        },
        files: [{
          expand: true,
          cwd: jsDir,
          src: ['**/*.js', '!**/*.min.js'],
          dest: distPath + '/' + jsDir,
          ext: '.js'
        }]
      }
    },

    // Copy Task
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: fontsDir,
            src: ['**'],
            dest: root + '/' + fontsDir
          },
          {
            expand: true,
            cwd: imagesDir,
            src: ['**'],
            dest: root + '/' + imagesDir
          },
          {
            expand: true,
            cwd: componentsDir,
            src: ['**'],
            dest: root + '/' + componentsDir
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: fontsDir,
            src: ['**'],
            dest: distPath + '/' + fontsDir
          },
          {
            expand: true,
            cwd: imagesDir,
            src: [
              '**',
              '!**/*.png',
              '!**/*.jpg',
              '!**/*.svg'
            ],
            dest: distPath + '/' + imagesDir
          }
        ]
      },
      ext: {
        files: [
          {
            expand: true,
            cwd: sassDir,
            src: userConfig.extension.sass,
            dest: '.compass/stylesheets'
          },
          {
            expand: true,
            cwd: imagesDir,
            src: userConfig.extension.images,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: jsDir,
            src: userConfig.extension.js,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: fontsDir,
            src: userConfig.extension.fonts,
            dest: '.compass/templates/project'
          }
        ]
      }
    },

    // Concat
    concat: {
      ext: {
        options: {
          process: true
        },
        files: {
          '.compass/lib/msrowe-style-guide.rb': ['.compass/.template/msrowe-style-guide.rb']
        }
      }
    },

    // Parallel Task
    parallel: {
      assets: {
        grunt: true,
        tasks: ['imagemin', 'svgmin', 'uglify:dist', 'copy:dist', 'generator:dist']
      },
      ext: {
        grunt: true,
        tasks: ['copy:ext', 'concat:ext']
      }
    },

    // Exec Task
    exec: {
      launch: {
        cmd: 'open http://localhost:' + port + '&& echo "Launched localhost:"' + port
      },
      commit: {
        cmd: function(commit) {
          return 'git add ' + distPath + ' && git commit -m "' + commit + '" ' + distPath;
        }
      },
      tagMake: {
        cmd: 'git tag ' + userConfig.client.version
      },
      tagPush: {
        cmd: 'git push --tags ' + userConfig.git.deployUpstream
      },
      deploy: {
        cmd: 'git subtree push --prefix .dist ' + gh_upstream + ' ' + gh_deploy
      },
      export: {
        cmd: function(path) {
          return 'cp -r ' + distPath + ' ' + path;
        }
      },
      ext: {
        cmd: 'cd .compass && gem build msrowe-style-guide.gemspec && mv msrowe-style-guide-' + userConfig.client.version + '.gem ../msrowe-style-guide-' + userConfig.client.version + '.gem && cd ..'
      },
      install: {
        cmd: 'gem install msrowe-style-guide-' + userConfig.client.version + '.gem && rm msrowe-style-guide-' + userConfig.client.version + '.gem'
      }
    },

    bump: {
      options: {
        files: [
          'package.json',
          'bower.json',
          '.system.json'
        ],
        commit: userConfig.bump.commit,
        commitFiles: userConfig.bump.files,
        createTag: userConfig.bump.tag,
        push: userConfig.bump.push,
        pushTo: userConfig.git.deployUpstream
      }
    }

  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config([
      'copy:dev',
      'uglify:dev',
      'compass:dev',
      'generator:dev',
      'jshint',
      'csslint'
    ], filepath);
  });

  //////////////////////////////
  // Grunt Task Loads
  //////////////////////////////
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  //////////////////////////////
  // Build Task
  //////////////////////////////
  grunt.registerTask('build', 'Production build', function() {
    var commit = grunt.option('commit');
    var deploy = grunt.option('deploy');

    grunt.task.run(['parallel:assets', 'compass:dist', 'jshint']);

    if (commit) {
      if (commit === true) {
        commit = gh_commit;
      }
      grunt.task.run(['exec:commit:' + commit]);
    }

    
    if (deploy) {
      grunt.task.run(['exec:deploy']);
    }
    
  });

  //////////////////////////////
  // Tag Task
  //////////////////////////////
  grunt.registerTask('tag', 'Tags your release', function() {
    var push = grunt.option('push');

    grunt.task.run('exec:tagMake');

    if (push) {
      grunt.task.run('exec:tagPush');
    }
  });

  
  //////////////////////////////
  // Deploy Task
  //////////////////////////////
  grunt.registerTask('deploy', [
    'exec:deploy'
  ]);

  //////////////////////////////
  // Export Task
  //////////////////////////////
  grunt.registerTask('export', 'Exports your build', function() {
    var path = grunt.option('to') || exportPath;

    grunt.task.run('build', 'exec:export:' + path);
  });

  //////////////////////////////
  // Server Task
  //////////////////////////////
  grunt.registerTask('server-init', [
    'copy:dev',
    'uglify:dev',
    'compass:dev',
    'generator:dev',
    'jshint',
    'csslint'
  ]);

  grunt.registerTask('server', 'Starts a development server', function() {

    var launch = grunt.option('launch');

    grunt.task.run(['server-init', 'connect']);

    if (launch) {
      grunt.task.run('exec:launch');
    }

    grunt.task.run('watch');

  });

  //////////////////////////////
  // Compass Extension
  //////////////////////////////
  grunt.registerTask('extension', 'Build your Compass Extension', function() {
    grunt.file.copy('bower.json', '.compass/templates/project/bower.json');
    grunt.file.copy('.editorconfig', '.compass/templates/project/editorconfig.txt');
    grunt.file.copy('.bowerrc', '.compass/templates/project/bowerrc.txt');
    grunt.file.copy('.jshintrc', '.compass/templates/project/jshintrc.txt');
    grunt.file.copy('.csslintrc', '.compass/templates/project/csslintrc.txt');

    // Add Styleguide to Gemfile
    var gemfile = grunt.file.read('Gemfile');
    gemfile += "\ngem 'msrowe-style-guide', '~>" + grunt.userConfig.client.version + "'";
    grunt.file.write('.compass/templates/project/Gemfile.txt', gemfile);

    grunt.task.run(['parallel:ext', 'exec:ext']);

    var install = grunt.option('install');

    if (install) {
      grunt.task.run(['exec:install']);
    }
  });
};