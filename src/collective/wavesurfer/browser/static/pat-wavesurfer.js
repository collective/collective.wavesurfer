(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'pat-base',
            'pat-registry',
            'pat-parser',
            'pat-logger',
            'wavesurfer'
        ], function() {
            return factory.apply(this, arguments);
        });
    } else {
        // If require.js is not available, you'll need to make sure that these
        // global variables are available.
        factory($, patterns.Base, patterns, patterns.Parser, patterns.logger,
            patterns.wavesurfer);
    }
}(this, function($, Base, registry, Parser, logger, W) {
    'use strict';

    var log = logger.getLogger('pat-wavesurfer');
    log.debug('pattern loaded');

    var parser = new Parser('wavesurfer');

    // // default controls
    parser.addArgument('url', undefined);
    parser.addArgument('peaks', undefined);

    // basic player settings
    parser.addArgument('height', 128);
    parser.addArgument('waveColor', '#999');
    parser.addArgument('progressColor', '#555');
    parser.addArgument('cursorColor', '#333');
    parser.addArgument('cursorWidth', 1);

    // waveform settings
    parser.addArgument('barHeight', 1);
    parser.addArgument('barWidth', undefined);
    parser.addArgument('fillParent', true);
    parser.addArgument('minPxPerSec', 50);

    // extended player settings
    parser.addArgument('maxCanvasWidth', 4000);
    parser.addArgument('renderer', 'Canvas');
    parser.addArgument('hideScrollbar', false);
    parser.addArgument('responsive', true);
    parser.addArgument('scrollParent', false);

    // extended waveform settings
    parser.addArgument('interact', true);
    parser.addArgument('pixelRatio', window.devicePixelRatio);
    parser.addArgument('autoCenter', true);

    // play and sound settings
    parser.addArgument('audioRate', 1);
    parser.addArgument('normalize', false);
    parser.addArgument('skipLength', 2);

    // backend
    parser.addArgument('backend', 'MediaElement');
    parser.addArgument('mediaType', 'audio');


    $("[data-pat-wavesurfer]").each(function() {
        var options = parser.parse($(this));
    });

    return Base.extend({
        name: 'wavesurfer',
        trigger: '.pat-wavesurfer',

        init: function patWavesurferInit () {

            var options = this.options = parser.parse(this.$el);

            this.wavesurfer = WaveSurfer.create({
                container: this.$el.find('.waveformWrapper')[0],
                peaks: options.peaks,
                height: options.height,
                waveColor: options.waveColor,
                progressColor: options.progressColor,
                cursorColor: options.cursorColor,
                cursorWidth: options.cursorWidth,
                barHeight: options.barHeight,
                barWidth: options.barWidth,
                fillParent: options.fillParent,
                minPxPerSec: options.minPxPerSec,
                maxCanvasWidth: options.maxCanvasWidth,
                renderer: options.renderer,
                hideScrollbar: options.hideScrollbar,
                responsive: options.responsive,
                scrollParent: options.scrollParent,
                interact: options.interact,
                pixelRatio: options.pixelRatio,
                autoCenter: options.autoCenter,
                audioRate: options.audioRate,
                normalize: options.normalize,
                skipLength: options.skipLength,
                backend: options.backend,
                mediaType: options.mediaType
            });

            //desperate attempt to get base_url of the protraxx file
            //lets get it from options.url
            // var base_url=options.url.split('/@@')[0]
            // var peak_url=base_url+'/@@peaks';

            // //request peak data from traxx and feed it into wavesurfer
            // $.ajax({
            //   url: peak_url,
            //   context: document.body,
            // }).done(function(data) {
            //   var peaks=JSON.parse(data)
            //   // this.wavesurfer.load(options.url,peaks)
            // });
            // debugger
            this.wavesurfer.load(options.url, JSON.parse(options.peaks), "none");

            function stopAllPlayers() {
                $('.pat-wavesurfer').each(function (idx, el) {
                    var $el = $(el);
                    var ws = $el.data('wavesurfer');
                    ws.pause();
                    $el.find('.btnPlay').removeClass('active');
                });
            }

            $(this.$el.find('.controlsContainer')).prepend('<div class="playerControls">\
                                <div class="btn btnPlay">\
                                </div>\
                              </div>');

            $(this.$el.find('.playerControls .btnPlay')).bind("click", function (el) {

                // console.log(this.wavesurfer.container.parentElement.parentElement.className + ' ' + this.wavesurfer.isPlaying())
                this.wavesurfer.setVolume(0.5);
                if (this.wavesurfer.isPlaying()) {
                  this.wavesurfer.pause();
                  $(el.target).removeClass('active');

                } else {
                  stopAllPlayers();
                  this.wavesurfer.play();
                  $(el.target).addClass('active');

                }
            }.bind(this));

            this.$el.data('wavesurfer', this.wavesurfer);
            log.debug('pattern initialized');


            window.addEventListener('resize', this.wavesurfer.drawBuffer.bind(this.wavesurfer));
        },
    });

}));