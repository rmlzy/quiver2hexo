/**
 * unmarked - an HTML to Markdown converter
 * Copyright (c) 2015, Yaogang Lian. (MIT Licensed)
 * https://github.com/ylian/unmarked
 */

;(function() {

/**
 * Helper Functions
 */

function escape(str) {
  return str.replace(/\s+/g, ' ') // collapse whitespaces
            .replace(/[\\*_#<>]/g, '\\$&') // escape special Markdown characters
            .replace(/(\d+)\. /g, '$1\\. '); // escape ol triggers
}

function repeat(str, times) {
  return (new Array(times+1)).join(str);
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function compact(str) {
  return str.replace(/^[\t\r\n]+|[\t\r\n]+$/g, '') // strip linebreaks
            .replace(/\n\s+\n/g, '\n\n') // collapse linebreaks
            .replace(/\n{3,}/g, '\n\n'); // collapse linebreaks
}

function merge(obj) {
  var i = 1, target, key;
  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }
  return obj;
}


/**
 * Converters
 */

var c = {};

// Block containers
c.div = c.article = c.section = c.address = c.center =
c.p = function(node, options, content, indent) {
  return '\n\n' + indent + content + '\n\n';
};

c.br = function(node, options) {
  if (options.gfm) { // use GFM linebreaks
    return '\n';
  } else {
    return '  \n';
  }
};

c.hr = function(node, options) {
  return '\n\n' + options.hrStyle + '\n\n';
};

c.h1 = c.title = function(node, options, content) {
  if (options.headerStyle === 'setext' && !/blockquote/i.test(node.parentNode.tagName)) {
    return '\n\n' + content + '\n' + repeat('=', content.length) + '\n\n';
  } else {
    return '\n\n# ' + content + '\n\n';
  }
};

c.h2 = function(node, options, content) {
  if (options.headerStyle === 'setext' && !/blockquote/i.test(node.parentNode.tagName)) {
    return '\n\n' + content + '\n' + repeat('-', content.length) + '\n\n';
  } else {
    return '\n\n## ' + content + '\n\n';
  }
};

c.h3 = function(node, options, content) {
  return '\n\n### ' + content + '\n\n';
};

c.h4 = function(node, options, content) {
  return '\n\n#### ' + content + '\n\n';
};

c.h5 = function(node, options, content) {
  return '\n\n##### ' + content + '\n\n';
};

c.h6 = function(node, options, content) {
  return '\n\n###### ' + content + '\n\n';
};

c.blockquote = function(node, options, content, indent) {
  return '\n\n' + indent + trim(compact(content)).replace(/^/gm, '> ') + '\n\n';
}

c.strong = c.b = function(node, options, content) {
  return options.boldStyle + content + options.boldStyle;
};

c.em = c.i = function(node, options, content) {
  return options.italicStyle + content + options.italicStyle;
};

c.del = function(node, options, content) {
  if (options.gfm) {
    return '~~' + content + '~~';
  } else {
    return content;
  }
};

c.ul = c.ol = function(node, options, content) {
  if (/ul|ol/i.test(node.parentNode.tagName)) {
    return content;
  } else if (/li/i.test(node.parentNode.tagName)) {
    return '\n' + content + '\n';
  } else {
    return '\n\n' + content + '\n\n';
  }
};

c.li = function(node, options, content, indent) {
  var parent = node.parentNode;
  var index = 0;
  for (var i=0, l=parent.childNodes.length; i<l; i++) {
    var n = parent.childNodes[i];
    if (/li/i.test(n.tagName)) index += 1;
    if (n === node) break;
  }
  var prefix = /ol/i.test(parent.tagName) ? index + '. ' : options.ulStyle + ' ';
  return indent + prefix + trim(compact(content)) + '\n';
};

c.a = function(node, options, content) {
  var href = node.getAttribute('href') || '';
  var title = node.getAttribute('title');
  if (!title && !href && !content) {
    return '';
  } else if (title) {
    return '[' + content + '](' + href + ' "' + title + '")';
  } else if (href === content || href === 'mailto:' + content) {
    // Convert to an automatic link
    return '<' + content + '>';
  } else {
    return '[' + content + '](' + href + ')';
  }
}

c.img = function(node, options) {
  var src = node.getAttribute('src') || '';
  var alt = escape(node.getAttribute('alt') || '');
  var title = node.getAttribute('title');
  if (title) {
    return '![' + alt + '](' + src + ' "' + title + '")';
  } else {
    return '![' + alt + '](' + src + ')';
  }
}

c.code = function(node, options, content) {
  if (/pre/i.test(node.parentNode.tagName)) {
    return content;
  } else if (/\n/.test(content)) {
    // Multi-line code block
    if (options.gfm) {
      return '\n\n' + '```\n' + content.replace(/^\n|\n$/g, '') + '\n```\n\n';
    } else {
      return '\n\n' + content.replace(/^/gm, '    ') + '\n\n';
    }
  } else if (content.length > 0) {
    return '`' + content + '`';
  } else {
    return '';
  }
};

c.pre = function(node, options, content, indent) {
  if (node.childNodes.length === 0) {
    return '';
  } else if (/code/i.test(node.childNodes[0].tagName) && options.gfm) {
    // Fenced code block
    return '\n\n' + '```\n' + content + '\n```\n\n';
  } else {
    return '\n\n' + indent + content.replace(/^/gm, '    ') + '\n\n';
  }
}


/**
 * Unmarked
 */

function unmarked(node, opt) {
  if (typeof node === 'string') {
    var div = document.createElement('div');
    div.innerHTML = node;
    node = div;
  }
  opt = merge({}, unmarked.defaults, opt || {});
  var md = compact(nodeToMarkdown(node, opt, ''));
  if (opt.trim) md = trim(md);
  return md;
}

function nodeToMarkdown(node, options, indent) {
  if (node.nodeType === 3) { // Text node
    // Skip empty text nodes directly inside <ol> or <ul>
    if (/ul|ol/i.test(node.parentNode.tagName) && /[\t\r\n\s]+/.test(node.nodeValue)) {
      return '';
    } else if (/code|pre/i.test(node.parentNode.tagName)) {
      return node.nodeValue;
    } else {
      return escape(node.nodeValue);
    }
  } else if (node.nodeType === 1) { // Element node
    var content = '';
    var newIndent = getIndent(node, options, indent);
    for (var i=0, l=node.childNodes.length; i<l; i++) {
      content += nodeToMarkdown(node.childNodes[i], options, newIndent);
    }
    return convert(node, options, content, newIndent);
  }
  return '';
}

function convert(node, options, content, indent) {
  var tag = node.tagName.toLowerCase();
  if (tag in unmarked.converters) {
    return unmarked.converters[tag](node, options, content, indent);
  } else if (options.ignored.indexOf(tag) !== -1) {
    return '';
  } else {
    return content;
  }
}

function getIndent(node, options, indent) {
  if (node.parentNode && (/li/i.test(node.parentNode.tagName) ||
    (/ul|ol/i.test(node.tagName) && /ul|ol/i.test(node.parentNode.tagName))))
    indent += repeat(' ', options.tabSize);
  return indent;
}


/**
 * Options
 */

unmarked.options =
unmarked.setOptions = function(opt) {
  merge(unmarked.defaults, opt);
  return unmarked;
};

unmarked.defaults = {
  gfm: false,
  trim: true, // trim whitespaces from beginning and end
  tabSize: 2,
  headerStyle: 'setext',
  hrStyle: '---',
  italicStyle: '*',
  boldStyle: '**',
  ulStyle: '*',
  ignored: ['head', 'script', 'style', 'meta']
};

unmarked.converters = c;
unmarked.addConverter = function(converter) {
  if (converter.tag) {
    var tag = converter.tag;
    unmarked.converters[tag] = converter.convert;
  }
  if (converter.tags) {
    for (var i=0, l=converter.tags.length; i<l; i++) {
      var tag = converter.tags[i];
      unmarked.converters[tag] = converter.convert;
    }
  }
};


/**
 * Expose
 */

if (typeof exports === 'object') {
  module.exports = unmarked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return unmarked; });
} else {
  this.unmarked = unmarked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
