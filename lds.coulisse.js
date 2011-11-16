/**
@fileOverview LuvDaSun Coulisse
@author <a href="mailto:elmerbulthuis@gmail.com">Elmer Bulthuis</a>
@version 0.8.2
@license LuvDaSun Coulisse - v0.8.3 - 2011-11-16

http://coulisse.luvdasun.com/

Copyright 2010-2011 "Elmer Bulthuis" <elmerbulthuis@gmail.com>
Dual licensed under the MIT and GPL licenses.

This project was made possible by its sponsors:

Anna Renaudin - www.annarenaudin.net
Grégoire Rist - www.expeo.net
*/


/**
@namespace
*/
if(typeof lds == 'undefined') lds = {};

(function (exports) {

	function findClosest(value, offset, mod)	{
		var mod2 = mod / 2;
		while(value > offset + mod2) value -= mod;
		while(value < offset - mod2) value += mod;
		return value;		
	}

	function normalize(value, mod)	{
		value %= mod;
		while(value < 0) value += mod;
		return value;		
	}



    /**
    Execute the specified getter on the specified object-instance and return the result
    @inner
    @function
    @param {Object} instance the object to execute the getter on
    @param {string|function(...[Object]):string} [getter]
    @returns {Object}
    */
    var executeGetter = function (instance, getter) {
        if (!getter) return instance;

        var typeofGetter = typeof getter;

        switch (typeofGetter) {
            case 'function':
                return getter.apply(instance);
                break;

            case 'string':
            case 'number':
                var member = instance[getter];
                var typeofMember = typeof member;
                switch (typeofMember) {
                    case 'function':
                        return member();
                        break;

                    default:
                        return member;
                }
                break;

            case 'object':
                switch (getter.constructor) {
                    case Array:
                        if (getter.length == 0) return instance;
                        else return executeGetter(executeGetter(instance, getter[0]), getter.slice(1));

                    default:
                        throw 'unknown object is not supported as a getter'
                }
                break;

            default:
                throw typeofGetter + ' is not supported as a getter'
        }
    };

    /**
    bind an event-handler to an object instance
    @inner
    @function
    @param {Object} instance the instance to bind the event to
    @param {string} eventName name of the event
    @param {function(Object)} handler that is triggered when the event is fired
    */
    var bindEvent = function (instance, eventName, handler) {
        if ('addEventListener' in instance) instance.addEventListener(eventName, handler, false);
        else if ('attachEvent' in instance) instance.attachEvent('on' + eventName, handler);
        else throw '' + eventName + ' event could not be bound';
    };
    /**
    unbind an event-handler from an object instance
    @inner
    @function
    @param {Object} instance the instance to unbind the event from
    @param {string} eventName name of the event
    @param {function(Object)} handler reference to the function that is being unbound
    */
    var unbindEvent = function (instance, eventName, handler) {
        if ('removeEventListener' in instance) instance.removeEventListener(eventName, handler, false);
        else if ('detachEvent' in instance) instance.detachEvent('on' + eventName, handler);
        else throw '' + eventName + ' event could not be unbound';
    };

    var lastAnimationHandle = 0;
    var animationHandles = {};
    /**
    @inner
    @function
    @param {number} offsetValue
    @param {number} targetValue
    @param {function(number,boolean)} onLoop
    @param {function(number,number,number,number,number):number} onCalculate
    @param {number} duration
    @param {number} interval
    @returns {number}
    */
    var setAnimation = function (offsetValue, targetValue, onLoop, onCalculate, duration, interval) {
        var animationHandle = ++lastAnimationHandle;
        var windowValue = targetValue - offsetValue;
        var offsetTimestamp = (new Date()).getTime();
        var loop = function () {
            var loopTimestamp = (new Date()).getTime();
            var time = loopTimestamp - offsetTimestamp;
            if (time < duration) {
                var loopValue = onCalculate(offsetValue, targetValue, windowValue, time, duration);
                onLoop(loopValue, false);
                animationHandles[animationHandle] = window.setTimeout(loop, interval);
            }
            else {
                delete animationHandles[animationHandle];
                onLoop(targetValue, true);
            }
        };
        loop();
        return animationHandle;
    };
    /**
    @inner
    @function
    @param {number} animationHandle
    */
    var clearAnimation = function (animationHandle) {
        window.clearTimeout(animationHandles[animationHandle]);
        delete animationHandles[animationHandle];
    };


    /**
    @inner
    @function
    @param {CanvasRenderingContext2D} context
    @param {HTMLImage|HTMLCanvas} source
    @param {number} pinch
    @param {number} [sliceCount]
    */
    var pinchLeft = function (context, source, pinch, sliceCount) {
        var canvasWidth = context.canvas.width;
        var canvasHeight = context.canvas.height;
        var sourceWidth = source.width;
        var sourceHeight = source.height;

        sliceCount = sliceCount || canvasWidth;
        for (var sliceIndex = 0; sliceIndex < sliceCount; sliceIndex++) {
            var sourceSliceLeft = Math.floor(sourceWidth * sliceIndex / sliceCount);
            var sourceSliceRight = Math.ceil(sourceWidth * (sliceIndex + 1) / sliceCount);

            var canvasSliceLeft = Math.floor(canvasWidth * sliceIndex / sliceCount);
            var canvasSliceRight = Math.ceil(canvasWidth * (sliceIndex + 1) / sliceCount);

            var canvasSlicePinch = pinch * canvasHeight * (sliceCount - sliceIndex - 1) / (sliceCount - 1);

            context.drawImage(
            source
            , sourceSliceLeft, 0, sourceSliceRight - sourceSliceLeft, sourceHeight
            , canvasSliceLeft, canvasSlicePinch / 2, canvasSliceRight - canvasSliceLeft, canvasHeight - canvasSlicePinch
            );
        }
    };

    /**
    @inner
    @function
    @param {CanvasRenderingContext2D} context
    @param {HTMLImage|HTMLCanvas} source
    @param {number} pinch
    @param {number} [sliceCount]
    */
    var pinchRight = function (context, source, pinch, sliceCount) {
        var canvasWidth = context.canvas.width;
        var canvasHeight = context.canvas.height;
        var sourceWidth = source.width;
        var sourceHeight = source.height;

        sliceCount = sliceCount || canvasWidth;
        for (var sliceIndex = 0; sliceIndex < sliceCount; sliceIndex++) {
            var sourceSliceLeft = Math.floor(sourceWidth * sliceIndex / sliceCount);
            var sourceSliceRight = Math.ceil(sourceWidth * (sliceIndex + 1) / sliceCount);

            var canvasSliceLeft = Math.floor(canvasWidth * sliceIndex / sliceCount);
            var canvasSliceRight = Math.ceil(canvasWidth * (sliceIndex + 1) / sliceCount);

            var canvasSlicePinch = pinch * canvasHeight * sliceIndex / (sliceCount - 1);

            context.drawImage(
            source
            , sourceSliceLeft, 0, sourceSliceRight - sourceSliceLeft, sourceHeight
            , canvasSliceLeft, canvasSlicePinch / 2, canvasSliceRight - canvasSliceLeft, canvasHeight - canvasSlicePinch
            );
        }
    };


    /**
    @class
    @param {HTMLElement} container
    @param {Object} [options]
    */
    exports.Coulisse = function (container, options) {
        var coulisse = this;

        /**
        repeat the first image after the last and vice versa

        thanks to

        Anna Renaudin - www.annarenaudin.net
        Grégoire Rist - www.expeo.net

        @field {Booleam}
        */
        var cyclic = options.cyclic || false;

        /**
        duration of the animation
        @field {number}
        */
        var duration = options.duration || 800;
        /**
        interval between animation steps (increase for better quality)
        @field {number}
        */
        var interval = options.interval || 20;
        /**
        slices of animating panels (increase or 0 for better quality)
        @field {number}
        */
        var sliceCount = options.sliceCount || 10;
        /**
        amount of the inactive panel that is visible (non-overlapped)
        @field {number}
        */
        var area = options.area || 0.5;
        /**
        amount of pinch for inactive panels
        @field {number}
        */
        var pinch = options.pinch || 0.2;
        /**
        width of inactive panels
        @field {number}
        */
        var scale = options.scale || 0.4;
        /**
        diagonal size of the active panel
        @field {number}
        */
        var activeSize = options.activeSize || 800;
        /**
        diagonal size of inactive panels
        @field {number}
        */
        var inactiveSize = options.inactiveSize || 400;

        /**
        @field {string}
        */
        var activateEvent = options.activateEvent || 'click';


        /**
        event fired when an inactive panel is activated
        @event
        */
        var onActivateIndex = options.onActivateIndex || null;
        /**
        event fired when the index starts changing
        @event
        */
        var onIndexChange = options.onIndexChange || null;
        /**
        event fired when the index has changed, but is not finished changing yet
        @event
        */
        var onIndexChanging = options.onIndexChanging || null;
        /**
        event fired when the index has finished changing
        @event
        */
        var onIndexChanged = options.onIndexChanged || null;

        /**
        @field {string}
        */
        var imageSrcGetter = options.imageSrcGetter || null;

        /**
        @field {string}
        */
        var linkHrefGetter = options.linkHrefGetter || null;


        var panels = [];
        /**
        @class
        @param {string} imageSrc
        */
        var Panel = function (panelIndex, imageSrc, linkHref) {
            var panel = this;
            var currentFaceIndex = null;
            var image = document.createElement('img');
            var link = linkHref ? document.createElement('a') : null;
            var canvas = (typeof HTMLCanvasElement == 'undefined') ? null : document.createElement('canvas');
            var context = canvas ? canvas.getContext('2d') : null;
            var loaded = false;
            var face = canvas || image;
            var element = link || face;
            var style = element.style;

            /**
            @function
            @param {Object} e
            */
            var elementActive = function (e) {
                if (index != panelIndex) {
                    if (!(onActivateIndex && onActivateIndex({ index: normalize(panelIndex, panels.length) }) === false)) {
                        coulisse.setIndex(panelIndex);
                    }
                    'preventDefault' in e && e.preventDefault();
                    return false;
                }
            };
            /**
            @function
            @param {Object} e
            */
            var imageLoad = function (e) {
                var imageWidth2 = image.width * image.width;
                var imageHeight2 = image.height * image.height;
                var imageDiagonal2 = imageWidth2 + imageHeight2;
                var imageDiagonal = Math.sqrt(imageDiagonal2);

                panel.activePanelWidth = image.width * activeSize / imageDiagonal;
                panel.activePanelHeight = image.height * activeSize / imageDiagonal;
                panel.inactivePanelWidth = scale * image.width * inactiveSize / imageDiagonal;
                panel.inactivePanelHeight = image.height * inactiveSize / imageDiagonal;
                panel.deltaWidth = panel.activePanelWidth - panel.inactivePanelWidth;
                panel.deltaHeight = panel.activePanelHeight - panel.inactivePanelHeight;

                if (link) {
                    link.appendChild(face);
                }
                container.appendChild(element);

                loaded = true;
                update(true);
            };

            /**
            (re)draw the panel
            @function
            @param {Object} state
            @param {number} faceIndex
            */
            this.update = function (state, faceIndex) {
                /*
                when the faceindex is an integer (0, 1, 3, -1, -5, etc...) the coulisse
                there are two types of images. The image in the center is the active
                image, the images on the left and right are the inactive images
                When the faceIndex is a float and not an integer (0.5, 1.2, -0.1,
                -5.99, 10.001, etc...) there is an extra type of image. This image is
                between active and inactive and is the transforming image. There may
                be up to two images of this type. They are the first image on the
                left or right of the active (center) image.

                panelIndex is always an integer, this is the position of the panel (image)
                in the carrousel. realIndex, is not. when the coulisse is moving realIndex
                is probably not an integer, but when it has stopped it is.
                */


                var result = true;

                
                if (!loaded) {
                    return result;
                }

                var display = true;
                var zIndex = state.panelCount - Math.abs(Math.round(faceIndex));

                /*
                if faceIndex is < 0 the image is right of the center.
                */
                if (faceIndex < 0) {
                    /*
                    if faceIndex is > -1 the image is transforming
                    */
                    if (faceIndex > -1) {
                        var panel2 = panels[(panelIndex + 1) % state.panelCount];
                        face.width = panel.inactivePanelWidth + panel.deltaWidth * state.realIndexModInv;
                        face.height = panel.inactivePanelHeight + panel.deltaHeight * state.realIndexModInv;
                        context && pinchRight(context, image, pinch * state.realIndexMod, sliceCount);
                        state.panelLeft = (container.offsetWidth - panel.activePanelWidth) / 2;
                        state.panelLeft -= (panel.inactivePanelWidth * area) * state.realIndexMod;
                        state.panelLeft -= (panel2.activePanelWidth - panel.activePanelWidth) / 2 * state.realIndexMod;
                    }
                    /*
                    if faceIndex is <= -1 the image is not transforming
                    */
                    else {
                        /*
                        if the currentFaceIndex > -1, the image was transforming.
                        The new image sould be untransformed
                        */
                        if (currentFaceIndex > -1) {
                            face.width = panel.inactivePanelWidth;
                            face.height = panel.inactivePanelHeight;
                            context && pinchRight(context, image, pinch);
                        }
                        display = state.panelLeft >= 0 - face.width;
                        state.panelLeft -= face.width * area;
                    }
                    /*
                    only update the position if the image is visible
                    */
                    if (display) {
                        style.left = (state.panelLeft) + 'px';
                        style.right = '';
                    }
                }
                /*
                when the image is not right of the center, it could be left of the
                center. The image is left of the center when the faceIndex > 0
                */
                else if (faceIndex > 0) {
                    /*
                    Find out if the image is transforming.
                    */
                    if (faceIndex < 1) {
                        var panel2 = panels[(panelIndex + state.panelCount - 1) % state.panelCount];
                        face.width = panel.inactivePanelWidth + panel.deltaWidth * state.realIndexMod;
                        face.height = panel.inactivePanelHeight + panel.deltaHeight * state.realIndexMod;
                        context && pinchLeft(context, image, pinch * state.realIndexModInv, sliceCount);
                        state.panelRight = (container.offsetWidth - panel.activePanelWidth) / 2;
                        state.panelRight -= (panel.inactivePanelWidth * area) * state.realIndexModInv;
                        state.panelRight -= (panel2.activePanelWidth - panel.activePanelWidth) / 2 * state.realIndexModInv;
                    }
                    /*
                    Image is not transforming
                    */
                    else {
                        /*
                        was the previous image transforming?
                        */
                        if (currentFaceIndex < 1) {
                            face.width = panel.inactivePanelWidth;
                            face.height = panel.inactivePanelHeight;
                            context && pinchLeft(context, image, pinch);
                        }
                        display = state.panelRight >= 0 - face.width;
                        state.panelRight -= face.width * area;
                    }
                    /*
                    if the image is not going to be displayed, don care about the
                    and save some (a tiny bit of) CPU time!
                    */
                    if (display) {
                        style.left = '';
                        style.right = (state.panelRight) + 'px';
                    }
                }
                /*
                the image is not left of the center, and not right of the center.
                So it has to be in the center! Just display the untransformed image,
                only a little resized.
                */
                else {
                    face.width = panel.activePanelWidth;
                    face.height = panel.activePanelHeight;
                    context && context.drawImage(image, 0, 0, image.width, image.height, 0, 0, face.width, face.height);
                    state.panelLeft = (container.offsetWidth - panel.activePanelWidth) / 2;
                    state.panelRight = (container.offsetWidth - panel.activePanelWidth) / 2;
                    if (display) {
                        style.left = (state.panelLeft) + 'px';
                        style.right = (state.panelRight) + 'px';
                    }
                }

                /*
                if the image is going to be displayed, display it! and set the
                right position
                */
                if (display) {
                    style.zIndex = zIndex;
                    style.top = style.bottom = ((container.offsetHeight - face.height) / 2) + 'px';
                    style.display = 'block';
                }
                /*
                if the imagfe should not be displayed, see if it it already hidden
                and hide it.
                */
                else {
                    result = style.display != 'none';
                    style.display = 'none';
                }

                /*
                the currentFaceIndex is not the faceIndex!
                */
                currentFaceIndex = faceIndex;

                /*
                this is false if the image was already hidden
                */
                return result;
            };


            /**
            destructor for the Panel object
            @function
            */
            this.destruct = function () {
                unbindEvent(element, activateEvent, elementActive);
                unbindEvent(image, 'load', imageLoad);

                container.removeChild(element);

                delete element;
                delete image;
                delete canvas;
            };

            //construct

            bindEvent(element, activateEvent, elementActive);
            bindEvent(image, 'load', imageLoad);

            style.display = 'none';
            style.position = 'absolute';

            if (link) link.href = linkHref;
            image.src = imageSrc;
        };


        /**
        @function
        @param {boolean} updateAll
        */
        var update = function (updateAll) {
            var panelCount = panels.length;

            if (!panelCount) return;

            var offsetPanelIndex = normalize(realIndex, panelCount);
            var state = {
                panelLeft: null
                , panelRight: null
                , panelCount: panelCount
                , realIndexInt: parseInt(realIndex)
                , realIndexMod: offsetPanelIndex % 1
                , realIndexModInv: 1 - offsetPanelIndex % 1
            };
            var offsetPanelIndex = parseInt(offsetPanelIndex);

        
            if(cyclic)  {
			    var leftPanelCount = parseInt(panelCount / 2);
			    var rightPanelCount = panelCount - leftPanelCount;
			    for(var leftPanelIndex = 0; leftPanelIndex < leftPanelCount; leftPanelIndex++)	{
				    var panelIndex = offsetPanelIndex;
				    panelIndex -= leftPanelIndex;
                    if(!cyclic && panelIndex < 0) break;

				    while(panelCount && panelIndex < 0) panelIndex += panelCount;
                    var panel = panels[panelIndex];
                    
                    var faceIndex = panelIndex - realIndex;
				    while(faceIndex < 0 - leftPanelCount) faceIndex += panelCount;
				    while(faceIndex > 0 + rightPanelCount) faceIndex -= panelCount;

                    if (!panel.update(state, faceIndex) && !updateAll) break;
			    }
			    for(var rightPanelIndex = 1; rightPanelIndex < rightPanelCount; rightPanelIndex++)	{
				    var panelIndex = offsetPanelIndex;
				    panelIndex += rightPanelIndex;
                    if(!cyclic && panelIndex >= panelCount) break;

				    while(panelIndex >= panelCount) panelIndex -= panelCount;
                    var panel = panels[panelIndex];

                    var faceIndex = panelIndex - realIndex;
				    while(faceIndex < 0 - leftPanelCount) faceIndex += panelCount;
				    while(faceIndex > 0 + rightPanelCount) faceIndex -= panelCount;

                    if (!panel.update(state, faceIndex) && !updateAll) break;
			    }
            }
            else   
            {
                for (var panelIndex = state.realIndexInt; panelIndex >= 0; panelIndex--) {
                    var panel = panels[panelIndex];
                    if (panel) {
                        if (!panel.update(state, panelIndex - realIndex) && !updateAll) break;
                    }
                }

                for (var panelIndex = state.realIndexInt + 1; panelIndex < state.panelCount; panelIndex++) {
                    var panel = panels[panelIndex];
                    if (panel) {
                        if (!panel.update(state, panelIndex - realIndex) && !updateAll) break;
                    }
                }
            }

        };


        /**
        @function
        */
        var windowResize = function () {
            update(true);
        };

        /**
        @function
        @param {number} newRealIndex
        @param {boolean} isFinal
        */
        var animationLoop = function (newRealIndex, isFinal) {
            var newIndex = Math.round(newRealIndex);
            if (index != newIndex) {
                index = newIndex;
                onIndexChanging && onIndexChanging({ index: normalize(index, panels.length) });
            }
            if (realIndex != newRealIndex) {
                realIndex = newRealIndex;
                update(false);
            }
            isFinal && stopAnimation();
        };


        /**
        @function
        @param {number} offsetValue
        @param {number} windowValue
        @param {number} time
        @param {number} duration
        @returns {number}
        */
        var animationCalculate = options.animationCalculate || function (offsetValue, targetValue, windowValue, time, duration) {
            return offsetValue + windowValue * Math.sin(Math.PI * time / duration / 2);
        };


        /**
        Pointer to the animation
        @field {?number}
        @type {?number}
        */
        var animationHandle;
        /**
        @function
        @param {number} newRealIndex
        */
        var startAnimation = function (newRealIndex) {
            var newIndex = Math.round(newRealIndex);

            onIndexChange && onIndexChange({ index: normalize(newIndex, panels.length) });

            animationHandle = setAnimation(
            realIndex
            , newIndex
            , animationLoop
            , animationCalculate
            , duration
            , interval
            );
        };
        /**
        @function
        */
        var stopAnimation = function () {
            if (animationHandle) {
                clearAnimation(animationHandle);
                animationHandle = null;
                onIndexChanged && onIndexChanged({ index: normalize(index, panels.length) });
            }
        };


        /**
        index of the panel
        @field {number}
        */
        var index = options.index || 0;
        /**
        real index
        @field {number}
        */
        var realIndex = index;
        /**
        set index of the panel
        @function
        @param {number} index
        */
        this.setIndex = function (value) {
            stopAnimation();
            startAnimation(
                cyclic
                ? findClosest(value, realIndex, panels.length)
                : normalize(value, panels.length)
            );
        };
        /**
        get index of the panel
        @function
        @returns {number}
        */
        this.getIndex = function () {
            return normalize(index, panels.length);
        };

        /**
        destructor for the Coulisse object
        @function
        */
        this.destruct = function () {
            stopAnimation();
            unbindEvent(window, 'resize', windowResize);
            for (var panel = panels.pop(); panel; panel = panels.pop()) {
                panel.destruct();
                delete panel;
            }
        };


        this.addImages = function (images) {
            for (var imageIndex = 0, imageCount = images.length; imageIndex < imageCount; imageIndex++) {
                var image = images[imageIndex];
                var imageSrc = executeGetter(image, imageSrcGetter);
                var linkHref = options.linkHrefGetter ? executeGetter(image, linkHrefGetter) : null;
                var panelIndex = panels.length;
                var panel = new Panel(panelIndex, imageSrc, linkHref)
                panels[panelIndex] = panel;
            }
        };
        this.countImages = function (images) {
            return panels.length;
        };


        //construct

        options.images && this.addImages(options.images);

        bindEvent(window, 'resize', windowResize);

        delete options;
    };
})(lds);

