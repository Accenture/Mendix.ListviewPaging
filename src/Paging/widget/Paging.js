define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/text!Paging/widget/template/Paging.html"
], function (declare, _WidgetBase, _TemplatedMixin, dojoStyle, dojoConstruct, lang, widgetTemplate) {
    "use strict";


    return declare("Paging.widget.Paging", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,

        _pagination: null,
        _widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
            this._pagination = {

                code: "",
                page: null,
                size: null,
                step: null,
                handle: null,

                // --------------------
                // Utility
                // --------------------

                // converting initialize data
                Extend: function (data) {
                    data = data || {};
                    this.size = data.size || 1;
                    this.page = data.page || 1;
                    this.step = data.step || 1;
                },

                // add pages by number (from [s] to [f])
                Add: function (s, f) {
                    for (var i = s; i < f; i++) {
                        if (i == this.page) {
                            this.code += '<li tabindex="1" data-value="' + i + '" class="active" aria-label="Goto Page ' + i + '">' + i + '</li>';
                        } else
                            this.code += '<li tabindex="1" data-value="' + i + '" aria-label="Goto Page ' + i + '">' + i + '</li>';
                    }
                },

                // add last page with separator
                Last: function () {
                    this.code += '<a class="break-view">...</a><li tabindex="1"  data-value="' + this.size + '" aria-label="Goto Page ' + this.size + '">' + this.size + '</li>';
                },

                // add first page with separator
                First: function () {
                    this.code += '<li aria-label="Goto Page 1" tabindex="1" data-value="1">1</li><a class="break-view">...</a>';
                },


                // --------------------
                // Script
                // --------------------

                // write pagination
                Finish: function () {
                    dojoConstruct.place(this.code, this.e);
                    this.code = "";
                },

                // find pagination type
                Start: function () {
                    dojoConstruct.empty(this.e);
                    if (this.size < this.step * 3 + 5) {
                        this.Add(1, this.size + 1);
                    }
                    else if (this.page < this.step * 3 + 1) {
                        this.Add(1, this.step * 3 + 3);
                        this.Last();
                    }
                    else if (this.page > this.size - this.step * 3) {
                        this.First();
                        this.Add(this.size - this.step * 3 - 1, this.size + 1);
                    }
                    else {
                        this.First();
                        this.Add(this.page - this.step, this.page + this.step + 1);
                        this.Last();
                    }
                    this.Finish();
                },


                // --------------------
                // Initialization
                // --------------------


                // create skeleton
                Create: function (e) {
                    var firstnode = dojoConstruct.create("ul", null, e);
                    this.e = firstnode;
                },

                // init
                Init: function (data) {
                    this.Extend(data);
                    //this.Create(e);
                    this.Start();
                }
            };

        },
        postCreate: function () {
            this._pagination.Create(this.domNode);
            this.connect(this._pagination.e, "click", function (e) {
                if (e.target && e.target.nodeName == "LI" && e.target.className != "active") {
                    var params;
                    if (this._contextObj) {
                        this._contextObj.set(this.Offset, e.target.getAttribute("data-value"));
                        mx.data.update({
                            guid: this._contextObj.getGuid()
                        });
                    }
                    else {
                        logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
                    }
                }
            });
            this.connect(this._pagination.e, "keyup", function (e) {
                if (e.keyCode === 13 && e.target && e.target.nodeName == "LI" && e.target.className != "active") {
                    var params;
                    if (this._contextObj) {
                        this._contextObj.set(this.Offset, e.target.getAttribute("data-value"));
                        mx.data.update({
                            guid: this._contextObj.getGuid()
                        });
                    }
                    else {
                        logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
                    }
                }
            });
        },

        update: function (obj, callback) {
            this._widgetBase = this.widgetBase;
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
            this.resize();
        },

        resize: function (box) {
            const count = parseInt(this._contextObj.get(this.Count).toString(), 10); // number of all items
            const pageNum = parseInt(this._contextObj.get(this.Offset).toString(), 10); //current page number/offset
            const pageSize = parseInt(this._contextObj.get(this.PageSize).toString(), 10); //number of items on the page
            const lastPage = Math.ceil(count / pageSize); //count last page
            this._pagination.Init({
                size: lastPage,
                page: pageNum, // selected page
                step: 1 // pages before and after current
            });
        },

        uninitialize: function () {
            if (this._pagination.handle != null) this._pagination.handle.remove();
            dojoConstruct.empty(this._pagination.e);
        },

        _updateRendering: function (callback) {
            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        _resetSubscriptions: function () {
            var _objectHandle = null,
                _attrHandle = null;
            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle, i) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                _objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this.resize();
                        this._updateRendering();
                    })
                });
                _attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.Count,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this.resize();
                        this._updateRendering();
                    })
                });
                this._handles = [_objectHandle, _attrHandle];
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["Paging/widget/Paging"]);