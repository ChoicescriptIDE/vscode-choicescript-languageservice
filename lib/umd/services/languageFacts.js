(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../data/commands", "../languageFacts/commands", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommands = exports.expandEntryStatus = exports.getPageBoxDirectives = exports.isCommonValue = exports.hslFromColor = exports.colorFrom256RGB = exports.svgElements = exports.html5Tags = exports.units = exports.basicShapeFunctions = exports.transitionTimingFunctions = exports.imageFunctions = exports.colorFunctions = exports.cssWideKeywords = exports.geometryBoxKeywords = exports.boxKeywords = exports.lineWidthKeywords = exports.lineStyleKeywords = exports.repeatStyleKeywords = exports.positionKeywords = exports.colorKeywords = exports.colors = void 0;
    var commands = require("../data/commands");
    var commands_1 = require("../languageFacts/commands");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    exports.colors = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgrey: '#a9a9a9',
        darkgreen: '#006400',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        grey: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgrey: '#d3d3d3',
        lightgreen: '#90ee90',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370d8',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#d87093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        red: '#ff0000',
        rebeccapurple: '#663399',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };
    exports.colorKeywords = {
        'currentColor': 'The value of the \'color\' property. The computed value of the \'currentColor\' keyword is the computed value of the \'color\' property. If the \'currentColor\' keyword is set on the \'color\' property itself, it is treated as \'color:inherit\' at parse time.',
        'transparent': 'Fully transparent. This keyword can be considered a shorthand for rgba(0,0,0,0) which is its computed value.',
    };
    exports.positionKeywords = {
        'bottom': 'Computes to ‘100%’ for the vertical position if one or two values are given, otherwise specifies the bottom edge as the origin for the next offset.',
        'center': 'Computes to ‘50%’ (‘left 50%’) for the horizontal position if the horizontal position is not otherwise specified, or ‘50%’ (‘top 50%’) for the vertical position if it is.',
        'left': 'Computes to ‘0%’ for the horizontal position if one or two values are given, otherwise specifies the left edge as the origin for the next offset.',
        'right': 'Computes to ‘100%’ for the horizontal position if one or two values are given, otherwise specifies the right edge as the origin for the next offset.',
        'top': 'Computes to ‘0%’ for the vertical position if one or two values are given, otherwise specifies the top edge as the origin for the next offset.'
    };
    exports.repeatStyleKeywords = {
        'no-repeat': 'Placed once and not repeated in this direction.',
        'repeat': 'Repeated in this direction as often as needed to cover the background painting area.',
        'repeat-x': 'Computes to ‘repeat no-repeat’.',
        'repeat-y': 'Computes to ‘no-repeat repeat’.',
        'round': 'Repeated as often as will fit within the background positioning area. If it doesn’t fit a whole number of times, it is rescaled so that it does.',
        'space': 'Repeated as often as will fit within the background positioning area without being clipped and then the images are spaced out to fill the area.'
    };
    exports.lineStyleKeywords = {
        'dashed': 'A series of square-ended dashes.',
        'dotted': 'A series of round dots.',
        'double': 'Two parallel solid lines with some space between them.',
        'groove': 'Looks as if it were carved in the canvas.',
        'hidden': 'Same as ‘none’, but has different behavior in the border conflict resolution rules for border-collapsed tables.',
        'inset': 'Looks as if the content on the inside of the border is sunken into the canvas.',
        'none': 'No border. Color and width are ignored.',
        'outset': 'Looks as if the content on the inside of the border is coming out of the canvas.',
        'ridge': 'Looks as if it were coming out of the canvas.',
        'solid': 'A single line segment.'
    };
    exports.lineWidthKeywords = ['medium', 'thick', 'thin'];
    exports.boxKeywords = {
        'border-box': 'The background is painted within (clipped to) the border box.',
        'content-box': 'The background is painted within (clipped to) the content box.',
        'padding-box': 'The background is painted within (clipped to) the padding box.'
    };
    exports.geometryBoxKeywords = {
        'margin-box': 'Uses the margin box as reference box.',
        'fill-box': 'Uses the object bounding box as reference box.',
        'stroke-box': 'Uses the stroke bounding box as reference box.',
        'view-box': 'Uses the nearest SVG viewport as reference box.'
    };
    exports.cssWideKeywords = {
        'initial': 'Represents the value specified as the property’s initial value.',
        'inherit': 'Represents the computed value of the property on the element’s parent.',
        'unset': 'Acts as either `inherit` or `initial`, depending on whether the property is inherited or not.'
    };
    exports.colorFunctions = [
        { func: 'rgb($red, $green, $blue)', desc: localize('css.builtin.rgb', 'Creates a Color from red, green, and blue values.') },
        { func: 'rgba($red, $green, $blue, $alpha)', desc: localize('css.builtin.rgba', 'Creates a Color from red, green, blue, and alpha values.') },
        { func: 'hsl($hue, $saturation, $lightness)', desc: localize('css.builtin.hsl', 'Creates a Color from hue, saturation, and lightness values.') },
        { func: 'hsla($hue, $saturation, $lightness, $alpha)', desc: localize('css.builtin.hsla', 'Creates a Color from hue, saturation, lightness, and alpha values.') }
    ];
    exports.imageFunctions = {
        'url()': 'Reference an image file by URL',
        'image()': 'Provide image fallbacks and annotations.',
        '-webkit-image-set()': 'Provide multiple resolutions. Remember to use unprefixed image-set() in addition.',
        'image-set()': 'Provide multiple resolutions of an image and let the UA decide which is most appropriate in a given situation.',
        '-moz-element()': 'Use an element in the document as an image. Remember to use unprefixed element() in addition.',
        'element()': 'Use an element in the document as an image.',
        'cross-fade()': 'Indicates the two images to be combined and how far along in the transition the combination is.',
        '-webkit-gradient()': 'Deprecated. Use modern linear-gradient() or radial-gradient() instead.',
        '-webkit-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        '-moz-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        '-o-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        'linear-gradient()': 'A linear gradient is created by specifying a straight gradient line, and then several colors placed along that line.',
        '-webkit-repeating-linear-gradient()': 'Repeating Linear gradient. Remember to use unprefixed version in addition.',
        '-moz-repeating-linear-gradient()': 'Repeating Linear gradient. Remember to use unprefixed version in addition.',
        '-o-repeating-linear-gradient()': 'RepeatingLinear gradient. Remember to use unprefixed version in addition.',
        'repeating-linear-gradient()': 'Same as linear-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop’s position and the first specified color-stop’s position.',
        '-webkit-radial-gradient()': 'Radial gradient. Remember to use unprefixed version in addition.',
        '-moz-radial-gradient()': 'Radial gradient. Remember to use unprefixed version in addition.',
        'radial-gradient()': 'Colors emerge from a single point and smoothly spread outward in a circular or elliptical shape.',
        '-webkit-repeating-radial-gradient()': 'Repeating radial gradient. Remember to use unprefixed version in addition.',
        '-moz-repeating-radial-gradient()': 'Repeating radial gradient. Remember to use unprefixed version in addition.',
        'repeating-radial-gradient()': 'Same as radial-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop’s position and the first specified color-stop’s position.'
    };
    exports.transitionTimingFunctions = {
        'ease': 'Equivalent to cubic-bezier(0.25, 0.1, 0.25, 1.0).',
        'ease-in': 'Equivalent to cubic-bezier(0.42, 0, 1.0, 1.0).',
        'ease-in-out': 'Equivalent to cubic-bezier(0.42, 0, 0.58, 1.0).',
        'ease-out': 'Equivalent to cubic-bezier(0, 0, 0.58, 1.0).',
        'linear': 'Equivalent to cubic-bezier(0.0, 0.0, 1.0, 1.0).',
        'step-end': 'Equivalent to steps(1, end).',
        'step-start': 'Equivalent to steps(1, start).',
        'steps()': 'The first parameter specifies the number of intervals in the function. The second parameter, which is optional, is either the value “start” or “end”.',
        'cubic-bezier()': 'Specifies a cubic-bezier curve. The four values specify points P1 and P2  of the curve as (x1, y1, x2, y2).',
        'cubic-bezier(0.6, -0.28, 0.735, 0.045)': 'Ease-in Back. Overshoots.',
        'cubic-bezier(0.68, -0.55, 0.265, 1.55)': 'Ease-in-out Back. Overshoots.',
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)': 'Ease-out Back. Overshoots.',
        'cubic-bezier(0.6, 0.04, 0.98, 0.335)': 'Ease-in Circular. Based on half circle.',
        'cubic-bezier(0.785, 0.135, 0.15, 0.86)': 'Ease-in-out Circular. Based on half circle.',
        'cubic-bezier(0.075, 0.82, 0.165, 1)': 'Ease-out Circular. Based on half circle.',
        'cubic-bezier(0.55, 0.055, 0.675, 0.19)': 'Ease-in Cubic. Based on power of three.',
        'cubic-bezier(0.645, 0.045, 0.355, 1)': 'Ease-in-out Cubic. Based on power of three.',
        'cubic-bezier(0.215, 0.610, 0.355, 1)': 'Ease-out Cubic. Based on power of three.',
        'cubic-bezier(0.95, 0.05, 0.795, 0.035)': 'Ease-in Exponential. Based on two to the power ten.',
        'cubic-bezier(1, 0, 0, 1)': 'Ease-in-out Exponential. Based on two to the power ten.',
        'cubic-bezier(0.19, 1, 0.22, 1)': 'Ease-out Exponential. Based on two to the power ten.',
        'cubic-bezier(0.47, 0, 0.745, 0.715)': 'Ease-in Sine.',
        'cubic-bezier(0.445, 0.05, 0.55, 0.95)': 'Ease-in-out Sine.',
        'cubic-bezier(0.39, 0.575, 0.565, 1)': 'Ease-out Sine.',
        'cubic-bezier(0.55, 0.085, 0.68, 0.53)': 'Ease-in Quadratic. Based on power of two.',
        'cubic-bezier(0.455, 0.03, 0.515, 0.955)': 'Ease-in-out Quadratic. Based on power of two.',
        'cubic-bezier(0.25, 0.46, 0.45, 0.94)': 'Ease-out Quadratic. Based on power of two.',
        'cubic-bezier(0.895, 0.03, 0.685, 0.22)': 'Ease-in Quartic. Based on power of four.',
        'cubic-bezier(0.77, 0, 0.175, 1)': 'Ease-in-out Quartic. Based on power of four.',
        'cubic-bezier(0.165, 0.84, 0.44, 1)': 'Ease-out Quartic. Based on power of four.',
        'cubic-bezier(0.755, 0.05, 0.855, 0.06)': 'Ease-in Quintic. Based on power of five.',
        'cubic-bezier(0.86, 0, 0.07, 1)': 'Ease-in-out Quintic. Based on power of five.',
        'cubic-bezier(0.23, 1, 0.320, 1)': 'Ease-out Quintic. Based on power of five.'
    };
    exports.basicShapeFunctions = {
        'circle()': 'Defines a circle.',
        'ellipse()': 'Defines an ellipse.',
        'inset()': 'Defines an inset rectangle.',
        'polygon()': 'Defines a polygon.'
    };
    exports.units = {
        'length': ['em', 'rem', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc', 'ch', 'vw', 'vh', 'vmin', 'vmax'],
        'angle': ['deg', 'rad', 'grad', 'turn'],
        'time': ['ms', 's'],
        'frequency': ['Hz', 'kHz'],
        'resolution': ['dpi', 'dpcm', 'dppx'],
        'percentage': ['%', 'fr']
    };
    exports.html5Tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
        'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer',
        'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link',
        'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q',
        'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
        'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'let', 'video', 'wbr'];
    exports.svgElements = ['circle', 'clipPath', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
        'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
        'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject', 'g', 'hatch', 'hatchpath', 'image', 'line', 'linearGradient',
        'marker', 'mask', 'mesh', 'meshpatch', 'meshrow', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'solidcolor', 'stop', 'svg', 'switch',
        'symbol', 'text', 'textPath', 'tspan', 'use', 'view'];
    /*export function isColorConstructor(node: nodes.Function): boolean {
        let name = node.getName();
        if (!name) {
            return false;
        }
        return /^(rgb|rgba|hsl|hsla)$/gi.test(name);
    }*/
    /**
     * Returns true if the node is a color value - either
     * defined a hex number, as rgb or rgba function, or
     * as color name.
     */
    /*
    export function isColorValue(node: nodes.Node): boolean {
        if (node.type === nodes.NodeType.HexColorValue) {
            return true;
        } else if (node.type === nodes.NodeType.Function) {
            return isColorConstructor(<nodes.Function>node);
        } else if (node.type === nodes.NodeType.Identifier) {
            if (node.parent && node.parent.type !== nodes.NodeType.Term) {
                return false;
            }
            let candidateColor = node.getText().toLowerCase();
            if (candidateColor === 'none') {
                return false;
            }
            if (colors[candidateColor]) {
                return true;
            }
        }
        return false;
    }*/
    var Digit0 = 48;
    var Digit9 = 57;
    var A = 65;
    var F = 70;
    var a = 97;
    var f = 102;
    function colorFrom256RGB(red, green, blue, alpha) {
        if (alpha === void 0) { alpha = 1.0; }
        return {
            red: red / 255.0,
            green: green / 255.0,
            blue: blue / 255.0,
            alpha: alpha
        };
    }
    exports.colorFrom256RGB = colorFrom256RGB;
    function hslFromColor(rgba) {
        var r = rgba.red;
        var g = rgba.green;
        var b = rgba.blue;
        var a = rgba.alpha;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h = 0;
        var s = 0;
        var l = (min + max) / 2;
        var chroma = max - min;
        if (chroma > 0) {
            s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
            switch (max) {
                case r:
                    h = (g - b) / chroma + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / chroma + 2;
                    break;
                case b:
                    h = (r - g) / chroma + 4;
                    break;
            }
            h *= 60;
            h = Math.round(h);
        }
        return { h: h, s: s, l: l, a: a };
    }
    exports.hslFromColor = hslFromColor;
    /*
    export function getColorValue(node: nodes.Node): Color {
        if (node.type === nodes.NodeType.HexColorValue) {
            let text = node.getText();
            return colorFromHex(text);
        } else if (node.type === nodes.NodeType.Function) {
            let functionNode = <nodes.Function>node;
            let name = functionNode.getName();
            let colorValues = functionNode.getArguments().getChildren();
            if (!name || colorValues.length < 3 || colorValues.length > 4) {
                return null;
            }
            try {
                let alpha = colorValues.length === 4 ? getNumericValue(colorValues[3], 1) : 1;
                if (name === 'rgb' || name === 'rgba') {
                    return {
                        red: getNumericValue(colorValues[0], 255.0),
                        green: getNumericValue(colorValues[1], 255.0),
                        blue: getNumericValue(colorValues[2], 255.0),
                        alpha
                    };
                } else if (name === 'hsl' || name === 'hsla') {
                    let h = getAngle(colorValues[0]);
                    let s = getNumericValue(colorValues[1], 100.0);
                    let l = getNumericValue(colorValues[2], 100.0);
                    return colorFromHSL(h, s, l, alpha);
                }
            } catch (e) {
                // parse error on numeric value
                return null;
            }
        } else if (node.type === nodes.NodeType.Identifier) {
            if (node.parent && node.parent.type !== nodes.NodeType.Term) {
                return null;
            }
            let term = node.parent;
            if (term.parent && term.parent.type === nodes.NodeType.BinaryExpression) {
                let expression = term.parent;
                if (expression.parent && expression.parent.type === nodes.NodeType.ListEntry && (<nodes.ListEntry>expression.parent).key === expression) {
                    return null;
                }
            }
    
            let candidateColor = node.getText().toLowerCase();
            if (candidateColor === 'none') {
                return null;
            }
            let colorHex = colors[candidateColor];
            if (colorHex) {
                return colorFromHex(colorHex);
            }
        }
        return null;
    }*/
    function getNumericValue(node, factor) {
        var val = node.getText();
        var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(%?)$/);
        if (m) {
            if (m[2]) {
                factor = 100.0;
            }
            var result = parseFloat(m[1]) / factor;
            if (result >= 0 && result <= 1) {
                return result;
            }
        }
        throw new Error();
    }
    function getAngle(node) {
        var val = node.getText();
        var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(deg)?$/);
        if (m) {
            return parseFloat(val) % 360;
        }
        throw new Error();
    }
    function isCommonValue(entry) {
        return entry.browsers.count > 1;
    }
    exports.isCommonValue = isCommonValue;
    function getPageBoxDirectives() {
        return [
            '@bottom-center', '@bottom-left', '@bottom-left-corner', '@bottom-right', '@bottom-right-corner',
            '@left-bottom', '@left-middle', '@left-top', '@right-bottom', '@right-middle', '@right-top',
            '@top-center', '@top-left', '@top-left-corner', '@top-right', '@top-right-corner'
        ];
    }
    exports.getPageBoxDirectives = getPageBoxDirectives;
    function expandEntryStatus(status) {
        switch (status) {
            case 'e':
                return 'experimental';
            case 'n':
                return 'nonstandard';
            case 'o':
                return 'obsolete';
            default:
                return 'standard';
        }
    }
    exports.expandEntryStatus = expandEntryStatus;
    function getEntryStatus(status) {
        switch (status) {
            case 'e':
                return '⚠️ Property is experimental. Be cautious when using it.️\n\n';
            case 'n':
                return '🚨️ Property is nonstandard. Avoid using it.\n\n';
            case 'o':
                return '🚨️️️ Property is obsolete. Avoid using it.\n\n';
            default:
                return '';
        }
    }
    var commandsArray = commands.fullCommandList;
    var fullCommandList;
    function getCommands() {
        if (!fullCommandList) {
            fullCommandList = [];
            for (var i = 0; i < commandsArray.length; i++) {
                var rawEntry = {
                    name: commandsArray[i],
                    desc: [
                        "**Command**: " + commandsArray[i],
                    ]
                };
                if (typeof commands.standardCommands[commandsArray[i]] !== "undefined"
                    && commands.standardCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.standardCommands[commandsArray[i]].desc + "\n```");
                }
                else if (typeof commands.flowCommands[commandsArray[i]] !== "undefined"
                    && commands.flowCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.flowCommands[commandsArray[i]].desc + "\n```");
                }
                rawEntry.desc.push("Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/" + commandsArray[i] + ")");
                fullCommandList.push(new commands_1.EntryImpl(rawEntry));
            }
        }
        return fullCommandList;
    }
    exports.getCommands = getCommands;
});
