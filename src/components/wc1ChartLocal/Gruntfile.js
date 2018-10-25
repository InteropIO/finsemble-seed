module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jscrambler: {
			kernel: {
				options: {
					keys: {
						accessKey: '6BB3990F9EABF3D913F0CC5981533FC195F1B57C',
						secretKey: 'A44D150A8B34F9A52D6E2198C1FDD8297F1CD27F'
					},
					params: {
						mode: 'mobile',
						literal_hooking:'0;3;0.2',
						dead_code: "%DEFAULT%",
						function_outlining: "%DEFAULT%",
						function_reordering: "%DEFAULT%",
						string_splitting: '0.1;0.5',
						domain_lock: '*.chartiq.com;*.xignite.com;localhost;127.0.0.1;*.fiddle.jshell.net;*.jsfiddle.net'
					}
				},
				files: [
					{src: [
					'js/core/core.js',
					'js/core/engine.js',
					'js/core/market.js',
					'js/core/microkernel.js',
					'js/core/timezone.js',
					'js/core/utility.js',
					], dest:'./'},
				]
			},
			FSBL: {
				options: {
					keys: {
						accessKey: '6BB3990F9EABF3D913F0CC5981533FC195F1B57C',
						secretKey: 'A44D150A8B34F9A52D6E2198C1FDD8297F1CD27F'
					},
					params: {
						mode: 'mobile',
						literal_hooking:'0;3;0.2',
						dead_code: "%DEFAULT%",
						function_outlining: "%DEFAULT%",
						function_reordering: "%DEFAULT%",
						string_splitting: '0.1;0.5',
						domain_lock: '*.chartiq.com;*.xignite.com;localhost;127.0.0.1'
					}
				},
				files: [
					{src: [
                    	'desktop/js/FSBL.js'
					], dest:'./'},
				]
			}
		},
		replace: {
			desktop: {
				src: ['desktop/templates/chartiq-desktop.html',
					'desktop/css/technician-font-icons.css'
					],             // source files array (supports minimatch)
				overwrite: true,
				replacements: [
				{
					from: '{cachebuster}',
					to: function (matchedWord) {   // callback replacement
						return Date.now();
					}
				}]
			}
		},
		insert: {
			options: {},
			main: {
				src: "DemoServer/leadlander.html",
				dest: "sample-template-advanced.html",
				match: "<head>"
			},
		}
	});

	grunt.loadNpmTasks('grunt-jscrambler');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-insert');

	/* todo, make demo should do more stuff https://github.com/ChartIQ/stx/issues/811 */
	grunt.registerTask('makedemo', ['jscrambler:kernel','insert']);
	grunt.registerTask('makeapplause', ['jscrambler:kernel']);
	grunt.registerTask('makedesktop', ['jscrambler:kernel', 'jscrambler:FSBL', 'replace:desktop']);
};
