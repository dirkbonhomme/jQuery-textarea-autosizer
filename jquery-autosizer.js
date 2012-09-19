/**
 * Autosize textarea height based on input
 *
 * @author Dirk Bonhomme <dirk@bytelogic.be>
 * @version 1.0 beta
 * @created 2012-09-19
 *
 * Enable:
 *  $(<textarea selector>).autosize();
 *
 *
 * Disable:
 *  $(<textarea selector>).autosize(false);
 *
 *
 * Handle autosize events:
 *  $(<textarea selector>).on('autosize', callback);
 *
 */
(function($){

    // CSS styles that define textarea's text size
    var sharedStyles = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent'];
    var sharedStylesLength = sharedStyles.length;

    // Required CSS styles for ghost element
    var ghostStyles = { wordWrap: 'break-word', whiteSpace: 'pre-wrap', position: 'absolute', left: '-9999px', top: '-9999px' };

    // Autosize handler. Copy textarea value to ghost and update height
    var updateHeight = function(event){

        // Collect relevant event data
        var $ghost = event.data.textarea.$ghost;
        var $textarea = $(event.data.textarea);
        var offset = event.data.offset;

        // Finish any ongoing animations
        $textarea.stop(true, true);
        $textarea.trigger('autosize');

        // Keep widths in sync and update ghost with new value
        $ghost.css('width', $textarea.width())
              .text($textarea[0].value);

        // Animate textarea to new height
        var currentHeight = $textarea.height();
        var newHeight = $ghost.height();
        if(currentHeight !== newHeight){
            $textarea.animate({
                height: newHeight + offset
            },{
                duration: 'fast',
                complete: function(){
                    $textarea.trigger('autosize');
                }
            });
        }
    };

    // Create jQuery plugin
    $.fn.autosize = function(status){
        return this.each(function(){

            // Validate element type
            var $textarea = $(this);
            if(this.type !== 'textarea') return false;

            // Disable autosize and return
            if(status === false){
                $textarea.off('input', updateHeight);
                $(window).off('resize', updateHeight);
                if(this.$ghost){
                    this.$ghost.remove();
                    delete this.$ghost;
                }
                return;
            }

            // Assemble data for use in event
            var eventData = {
                offset: $textarea.innerHeight() - $textarea.height(),
                textarea: this
            };

            // Execute autosizer and return if already enabled
            if(this.$ghost){
                updateHeight({data: eventData});
                return;
            }

            // Apply some required styles to textarea
            $textarea.css({ overflow: 'hidden', resize: 'none' });

            // Create ghost element with same markup as textarea
            var $ghost = $('<div/>').css(ghostStyles);
            for(var i = 0; i < sharedStylesLength; i++){
                $ghost.css(sharedStyles[i], $textarea.css(sharedStyles[i]));
            }
            $ghost.appendTo('body');
            this.$ghost = $ghost;

            // Trigger update on input change and window resize
            updateHeight({data: eventData});
            $textarea.on('input', eventData, updateHeight);
            $(window).on('resize', eventData, updateHeight);
        });
    };

}(window.$));