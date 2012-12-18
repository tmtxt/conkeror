/**
 * (C) Copyright 2008 Jeremy Maitin-Shepard
 * (C) Copyright 2008 Nelson Elhage
 *
 * Use, modification, and distribution are subject to the terms specified in the
 * COPYING file.
**/

require("io.js");
require("completers.js");


function directory_p (file) {
    return file.exists() && file.isDirectory();
}


function file_path_completions (completer, data) {
    completions.call(this, completer, data);
}
file_path_completions.prototype = {
    constructor: file_path_completions,
    __proto__: completions.prototype,
    toString: function () "#<file_path_completions>",
    get_string: function (i) this.data[i].path
};


define_keywords("$test");
function file_path_completer () {
    keywords(arguments, $test = constantly(true));
    completer.call(this);
    this.test = arguments.$test;
}
file_path_completer.prototype = {
    constructor: file_path_completer,
    __proto__: completer.prototype,
    toString: function () "#<file_path_completer>",
    test: null,
    separator_p: function (s) {
        return s == "/" || (WINDOWS && s == "\\");
    },
    complete: function (input, pos) {
        var s = input.substring(input, pos);
        var next_char_separator_p = this.separator_p(input.substr(pos, 1));
        var ents = [];
        try {
            var f = make_file(s);
            if (f.exists() && f.isDirectory())
                var dir = f;
            else
                dir = f.parent;
            if (! dir.exists())
                return null;
            var iter = dir.directoryEntries;
            while (iter.hasMoreElements()) {
                var e = iter.getNext().QueryInterface(Ci.nsIFile);
                if (this.test(e))
                    ents.push(e);
            }
        } catch (e) {
            return null;
        }
        return new file_path_completions(this, ents);
    }
};


/* keywords: $prompt, $initial_value, $history, $completer, $auto_complete */
minibuffer.prototype.read_file_path = function () {
    keywords(arguments,
             $prompt = "File:",
             $initial_value = cwd.path,
             $history = "file",
             $completer = null);
    var result = yield this.read(
        $prompt = arguments.$prompt,
        $initial_value = arguments.$initial_value,
        $history = arguments.$history,
        $completer = arguments.$completer || new file_path_completer(),
        $auto_complete);
    yield co_return(result);
};

minibuffer.prototype.read_file = function () {
    var result = yield this.read_file_path(forward_keywords(arguments));
    yield co_return(make_file(result));
};

minibuffer.prototype.read_existing_file = function () {
    var result = yield this.read_file_path(
        forward_keywords(arguments),
        $require_match);
    yield co_return(result);
};

minibuffer.prototype.read_directory_path = function () {
    function validator (x) {
        try {
            return directory_p(make_file(x));
        } catch (e) {
            return false;
        }
    }
    var result = yield this.read_file_path(
        forward_keywords(arguments),
        $completer = new file_path_completer($test = directory_p),
        $validator = validator); //XXX: check if this works.  it's okay if
                                 //the result doesn't exist, but not okay
                                 //if it exists but is not a directory.
    yield co_return(result);
};

minibuffer.prototype.read_existing_directory_path = function () {
    var result = yield this.read_directory_path(
        forward_keywords(arguments),
        $require_match);
    yield co_return(result);
};

minibuffer.prototype.read_file_check_overwrite = function () {
    keywords(arguments);
    var initial_value = arguments.$initial_value;
    do {
        var path = yield this.read_file_path(forward_keywords(arguments),
                                             $initial_value = initial_value);
        var file = make_file(path);
        if (file.exists()) {
            var overwrite = yield this.read_yes_or_no($prompt = "Overwrite existing file " + path + "?");
            if (!overwrite) {
                initial_value = path;
                continue;
            }
        }
        yield co_return(file);
    } while (true);
};

provide("minibuffer-read-file");
