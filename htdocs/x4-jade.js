(function($)
{
  'use strict';


  //------------------------------------------------------------------------------
  //
  // @section Namespacing
  //
  //------------------------------------------------------------------------------

  /**
   * Theme namespace
   * @type {{ FilterManager: null }}
   */
  var x4 = {
    FilterManager: null
  };


  //------------------------------------------------------------------------------
  //
  // @section Class `FilterManager`
  //
  //------------------------------------------------------------------------------

  /**
   * FilterManager
   * @static
   * @type {Object}
   */
  var FilterManager = x4.FilterManager = {};


  //------------------------------------------------------------------------------
  //
  // @section Properties
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  // @part Constant
  //------------------------------------------------------------------------------

  /**
   * All available input filters.
   * @const
   * @memberOf {FilterManager}
   * @type {Array}
   */
  FilterManager.INPUT_FILTERS = [
    {
      // filter: url(resources.svg#c1)
      name: 'url',
      type: 'url'
    },
    {
      // filter: blur(5px)
      min:  0,
      max:  10,
      name: 'blur',
      type: 'length',
      unit: 'px',
      step: 0.1,
      value: 0
    },
    {
      // filter: brightness(0.5)
      min:  0.05,
      max:  1,
      name: 'brightness',
      type: 'length',
      step: 0.01,
      value: 1
    },
    {
      // filter: contrast(200%)
      min: 0.1,
      max: 1,
      name: 'contrast',
      type: 'length',
      step: 0.01,
      value: 1
    },
    {
      // filter: drop-shadow(16px 16px 10px black)
      name: 'drop-shadow',
      type: 'length[]'
      /*
      @TODO
        * %l = <length>
        * %c = <color>
        * format: '%l %l %l %c'
      */
    },
    {
      // filter: grayscale(100%)
      min: 0,
      max: 1,
      name: 'grayscale',
      type: 'length',
      step: 0.01,
      value: 0
    },
    {
      // filter: hue-rotate(90deg)
      min: 0,
      max: 360,
      name: 'hue-rotate',
      type: 'length',
      unit: 'deg',
      step: 0.1,
      value: 0
    },
    {
      // filter: invert(100%)
      min: 0,
      max: 1,
      name: 'invert',
      type: 'length',
      step: 0.01,
      value: 0
    },
    {
      // filter: opacity(50%)
      name: 'opacity',
      type: 'length',
      min: 0.1,
      max: 1,
      step: 0.01,
      value: 1
    },
    {
      // filter: saturate(200%)
      min: 0,
      max: 1,
      name: 'saturate',
      type: 'length',
      step: 0.01,
      value: 1
    },
    {
      // filter: sepia(100%)
      min: 0,
      max: 1,
      name: 'sepia',
      type: 'length',
      step: 0.01,
      value: 0
    }
  ];

  /**
   * The default options
   * @private
   * @type {{}}
   */
  FilterManager._defaultOptions = {

  };

  //------------------------------------------------------------------------------
  //
  // @section Methods
  //
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  // @part Private
  //------------------------------------------------------------------------------

  /**
   * Gets an filter from `FilterManager.INPUT_FILTERS`
   * @private
   * @memberOf {FilterManager}
   * @param {String} name
   * @returns {Object|undefined}
   */
  FilterManager._getInputFilter = function(name)
  {
    var result = undefined;

    for (var index = 0, length = FilterManager.INPUT_FILTERS.length;
         index < length;
         index++
    ) {
      var inputFilter = FilterManager.INPUT_FILTERS[index];

      if (name == inputFilter.name)
      {
        result = inputFilter;
        break;
      }
    }

    return result;
  };

  /**
   * Gets the filter value in the right format.
   * @private
   * @memberOf {FilterManager}
   * @param {String} name
   * @param {*} value
   * @returns {String|undefined}
   */
  FilterManager._getInputFilterValue = function(name, value)
  {
    var filter = this._getInputFilter(name);
    var result = undefined;
    var unit = filter.unit;

    if (filter !== undefined)
    {
      if (value === undefined || value === null)
      {
        // @TODO.
      }
      else switch (filter.type)
      {
        case 'length':
          // @TODO: Which precision?
          // @TODO: "Rotation" values (-11111 usw.)
          switch (unit)
          {
            case 'px':
            case 'deg':
              value = parseFloat(value);
              break;

            default:
              value = (Math.round(parseFloat(value) * 100) / 100);
              break;
          }

          result = '' + name + '(' + value + (filter.unit || '') + ')';
            console.info(result);
          break;

        case 'length[]':
          break;

        // Special cases
        case 'url':
          break;

        default:
          throw new Error(
              'Unknown filter type `%s`'
                  .replace('%s', filter.type)
          );
          break;
      }
    }

    return result;
  };

  /**
   * Applies a filter value to a element.
   * @private
   * @param {jQuery} $element
   * @param {String} name
   * @param {String} value
   */
  FilterManager._applyInputFilter = function($element, name, value)
  {
    // Get the formatted value string
    var result = this._getInputFilterValue(name, value);

    // Collect the existing filters
    var filters = $element.css('-webkit-filter').split(/\s+/);

    for (var index = 0, length = filters.length;
         index < length;
         index++
    ) {
      // @TODO: Are multiple filters of the same type possible?
      // Decide how to handle insertion of the new/modified filter value

      var filter = filters[index].substr(0, filters[index].indexOf('('));

      if (name == filter)
      {
        filters.splice(index, 1, result);
        break;
      }
      else if (index == length -1)
      {
        filters.push(result);
      }
    }

    // And finally apply the modified filter
    $element.css('-webkit-filter', filters.join(' '));
  };

  FilterManager._createInputAttributes = function(filterData)
  {
    var result = $.extend({}, filterData);

    switch (result.type)
    {
      case 'length':
        result.type = 'range';
        break;

      default:
        // @TODO
        break;
    }

    return result;
  };

  FilterManager._createFilterElements = function(filterData)
  {
    var $dt = $('<dt>%s</dt>'.replace('%s', filterData.name));
    var $dd = $('<dd />');
    var $input;

    switch (filterData.type)
    {
      case 'length':
        $input = $('<input />')
            .attr(this._createInputAttributes(filterData))
            .change(this._onInputFilterChange)
            .appendTo($dd);
        break;

      case 'length[]':
      case 'url':
        break;
    }

    // Return a new jQuery collection
    return $().add($dt).add($dd);
  };

  FilterManager._createElements = function($target)
  {
    var $dl = $('<dl />');

    for (var index = 0, length = this.INPUT_FILTERS.length;
         index < length;
         index++
    ) {
      $dl.append(this._createFilterElements(this.INPUT_FILTERS[index]));
    }

    $target.append($dl);
  };


  //------------------------------------------------------------------------------
  //
  // @section Event handlers
  //
  //------------------------------------------------------------------------------

  FilterManager._onInputFilterChange = function(event)
  {
    FilterManager._applyInputFilter(
        $('html'),
        event.target.name,
        event.target.value
    );
  };


  //------------------------------------------------------------------------------
  //
  // @section Plugin definition
  //
  //------------------------------------------------------------------------------

  $.fn.x4_FilterManager = function(options)
  {
    var $this = $(this);

    // Create new option object
    options = $.extend({},
        FilterManager._defaultOptions,
        options
    );

    $this.each(function(index, value)
    {
      FilterManager._createElements($(value));
    });
  };

})(jQuery);