  /**
    * 
    *  _||_
    * |    |
    * |    |
    * |    |       Tipple
    * |~~~~|
    * |_--_|  =]
    *
    *
    * Tipple is a simple JS templating solution.
    *
    *
    * @author Devin Ivy
    * @email devin@bigroomstudios.com
    * @website http://devinivy.com
    *
    * @dependency jQuery 1.7+
    * @version 1.0
    *
    * @license MIT
    * @enjoy
    *
    */
    
    (function ($) {
        
        $.extend({tplFilters: {
            
            html: function (content) {
                
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': '&quot;',
                    "'": '&#39;',
                    "/": '&#x2F;'
                };
                
                return String(content).replace(/[&<>"'\/]/g, function (s) {
                    return entityMap[s];
                });
                
            },
            
            attr: function (content) {
                
                var entityMap = {
                    '"': '&quot;',
                    "'": '&#39;',
                };
                
                return String(content).replace(/["']/g, function (s) {
                    return entityMap[s];
                });
                
            },
            
            url: function (content) {
                content = String(content);
                return encodeURI(content);            
            },
            
            nl2br: function (content) {
                return String(content).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
            },
            
            currency : function (content) {
                content = Number(content).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
                return (content == 'NaN') ? '' : content;
            },
            
            upper: function (content) {
                return String(content).toUpperCase();
            },
            
            lower: function (content) {
                return String(content).toLowerCase();
            },
            
            title: function (content) {
                content = String(content).replace(/[^-\s]+/g, function(word) {
                    return word.replace(/^./, function(first) {
                        return first.toUpperCase();
                    });
                });
                
                return content;
            }
            
        }});
        
        $.fn.tipple = function (replacements, justReturn) {
            
            // when sent null, current active tipples matching the selector are cleared
            if (replacements === null) {
                this.each(function(i, item){
                    
                    var tmpspawn;
                    var spawn = $(item).prev('[tpl-a]');
                    
                    while (spawn.length) {
                        tmpspawn = $(spawn).prev('[tpl-a]');
                        spawn.remove();
                        spawn = tmpspawn;
                    }
                    
                });
                
                return this;
                
            // otherwise, we create some active tipples with the replacements
            } else {
                
                justReturn = justReturn || false;
        
                var regex, matches;
                var origs = this.filter('[tpl], [tpl-each]');
                var clone = origs.first().clone().removeAttr('tpl tpl-each');
                var attribs = ['src'];
                
                // making the proper replacements
                var newHTML = clone.html() || '';
                var content;
                for (var name in replacements) {
                    
                    // allow content to be passed as a jQuery object
                    content = replacements[name];
                    if (content instanceof jQuery) {
                        if (content.length) {
                            content = content[0].outerHTML;  
                        } else {
                            content = '';
                        }
                    }
                    
                    regex = new RegExp('{[\\s]*(' +
                                       name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') +
                                       ')[\\s]*(|[^}:]+)?(:[^}]+)?}', 'g');
                    // apply filters
                    newHTML = newHTML.replace(regex, function(m, n, filters, dfault) {
                        
                        if (dfault) {
                            dfault = String(dfault).substring(1).trim();
                        } else {
                            dfault = '';
                        }
                        
                        if (filters) {
                            
                            filters = filters.substring(1).split('|');
                            
                            var filter;
                            var tmpContent = content;
                            for (var i = 0; i < filters.length; i++) {
                                filter = String(filters[i]).trim();
                                tmpContent = $.tplFilters[filter](tmpContent);
                            }
                            
                            return tmpContent ? tmpContent : dfault;
                            
                        } else {
                            return content ? content : dfault;
                        }
                    });
    
                }
        
                clone.html(newHTML);
                
                // set special attributes, like tpl-src to src. this prevents unwanted requests.
                var attrib;
                for (var j = 0; j < attribs.length; j++) {
                    attrib = attribs[j];
                    clone.find('[tpl-' + attrib + ']').each(function (i, subtpl) {
                        subtpl = $(subtpl);
                        subtpl.attr(attrib, subtpl.attr('tpl-' + attrib)).removeAttr('tpl-' + attrib);
                    });
                }
                
                // if you dont just want the tipple clone returned, insert it.
                if (!justReturn) {
                    origs.each(function (i, orig) {
                        
                        if ($(orig).is('[tpl]')) {
                            $(orig).tipple(null);
                        }
                        
                        clone.attr('tpl-a','').insertBefore(orig);
                        
                    });
                }
        
                return clone;
            }
        }
    })(jQuery);
    
