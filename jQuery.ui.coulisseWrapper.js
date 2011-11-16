/**
@fileOverview jQuery-ui wrapper for LuvDaSun Coulisse
@author <a href="mailto:elmerbulthuis@gmail.com">Elmer Bulthuis</a>
@version 0.3.1
@license jQuery-ui wrapper for LuvDaSun Coulisse - v0.3.2 - 2011-11-16
http://coulisse.luvdasun.com/

Copyright 2010-2011 "Elmer Bulthuis" <elmerbulthuis@gmail.com>
Dual licensed under the MIT and GPL licenses.
*/
typeof jQuery != 'undefined' &&
typeof jQuery.ui != 'undefined' &&
(function ($) {
    $.widget('lds.coulisse', {
        widgetEventPrefix: 'coulisse'

	        , options: {
	            duration: null
	            , area: 0.5
	            , pinch: 0.5
	            , scale: 0.5
                , sliceCount: 20
                , activeSize: 800
                , inactiveSize: 400
                , index: 0
	        }

            , _coulisse: null

            , _create: function () {
                var widget = this;

                var options = this.options;
                var coulisse = new lds.Coulisse(this.element[0], {
                    duration:
                    $.fx.off
                    ? 0
                    : typeof options.duration == "number"
                    ? options.duration
                    : options.duration in $.fx.speeds
                    ? $.fx.speeds[options.duration]
                    : $.fx.speeds._default
                    , interval: $.fx.interval
                    , sliceCount: options.sliceCount
                    , area: options.area
                    , pinch: options.pinch
                    , scale: options.scale
                    , activeSize: options.activeSize
                    , inactiveSize: options.inactiveSize
                    , images: options.images
                    , imageSrcGetter: options.imageSrcGetter
                    , linkHrefGetter: options.linkHrefGetter
                    , index: options.index
                    , onActivateIndex: function (e) { return widget._trigger('activateIndex', null, e); }
                    , onIndexChange: function (e) { return widget._trigger('indexChange', null, e); }
                    , onIndexChanging: function (e) { return widget._trigger('indexChanging', null, e); }
                    , onIndexChanged: function (e) { return widget._trigger('indexChanged', null, e); }
                    , animationCalculate: null
                    , cyclic:   options.cyclic
                    , activateEvent:    options.activateEvent
                });

                this._coulisse = coulisse;
                this.element.addClass('lds-coulisse');

                $.Widget.prototype._create.apply(this, arguments);
            }

            , destroy: function () {
                this.element.removeClass('lds-coulisse');
                this._coulisse.destruct();
                delete this._coulisse;

                $.Widget.prototype.destroy.apply(this, arguments);
            }

	        , _setOption: function (key, value) {
	            switch (key) {
	                case 'index':
	                    this._coulisse.setIndex(value);
	                    break;

	                case 'images':
	                    this._coulisse.addImages(value);
	                    break;

	                default:
	                    //$.Widget.prototype._setOption.apply(this, arguments);
	                    break;
	            }
	        }
	        , _getOption: function (key) {
	            switch (key) {
	                case 'index':
	                    return this._coulisse.getIndex();

	                case 'images':
	                    return this._coulisse.countImages();
	                    break;

	                default:
	                    //return $.Widget.prototype._getOption.apply(this, arguments);
	                    return null;
	            }
	        }

    });

})(jQuery);








