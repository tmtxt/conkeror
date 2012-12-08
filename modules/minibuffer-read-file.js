/**
 * (C) Copyright 2008 Jeremy Maitin-Shepard
 * (C) Copyright 2008 Nelson Elhage
 *
 * Use, modification, and distribution are subject to the terms specified in the
 * COPYING file.
**/

require("io.js");
require("completers.js");


function file_name_completions (completer, data) {
    completions.call(this, completer, data);
}
file_name_completions.prototype = {
    constructor: file_name_completions,
    __proto__: completions.prototype,
    toString: function () "#<file_name_completions>",
    get_string: function (i) this.data[i].path
};


function file_path_completer () {
    completer.call(this);
}
file_path_completer.prototype = {
    constructor: file_path_completer,
    __proto__: completer.prototype,
    toString: function () "#<file_path_completer>",
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
                ents.push(e);
            }
        } catch (e) {
            return null;
        }
        return new file_name_completions(this, ents);
    }
};


/* keywords: $prompt, $initial_value, $history, $completer, $auto_complete */
minibuffer.prototype.read_file_path = function () {
    keywords(arguments, $prompt = "File:", $initial_value = cwd.path,
             $history = "file");
    var result = yield this.read(
        $prompt = arguments.$prompt,
        $initial_value = arguments.$initial_value,
        $history = arguments.$history,
        $completer = new file_path_completer(),
        $auto_complete = true);
    yield co_return(result);
};

minibuffer.prototype.read_file = function () {
    var result = yield this.read_file_path(forward_keywords(arguments));
    yield co_return(make_file(result));
};

// FIXME
minibuffer.prototype.read_existing_file = minibuffer.prototype.read_file;
minibuffer.prototype.read_directory_path = minibuffer.prototype.read_file_path;
minibuffer.prototype.read_existing_directory_path = minibuffer.prototype.read_directory_path;

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
