/**
 * (C) Copyright 2008 Nelson Elhage
 *
 * Use, modification, and distribution are subject to the terms specified in the
 * COPYING file.
**/

require("content-buffer.js");
require("bindings/default/content-buffer/normal.js");

define_keymap("google_calendar_keymap", $parent = content_buffer_normal_keymap);

define_key(google_calendar_keymap, "c", null, $fallthrough);
define_key(google_calendar_keymap, "C-c c", "copy");

define_key(google_calendar_keymap, "/", null, $fallthrough);
define_key(google_calendar_keymap, "p", null, $fallthrough);
define_key(google_calendar_keymap, "j", null, $fallthrough);
define_key(google_calendar_keymap, "n", null, $fallthrough);
define_key(google_calendar_keymap, "k", null, $fallthrough);
define_key(google_calendar_keymap, "t", null, $fallthrough);
define_key(google_calendar_keymap, "C-c t", "follow-top");

define_key(google_calendar_keymap, "d", null, $fallthrough);
define_key(google_calendar_keymap, "x", null, $fallthrough);
define_key(google_calendar_keymap, "C-c x", "shell-command-on-file");
define_key(google_calendar_keymap, "w", null, $fallthrough);
define_key(google_calendar_keymap, "m", null, $fallthrough);
define_key(google_calendar_keymap, "a", null, $fallthrough);
define_key(google_calendar_keymap, "q", null, $fallthrough);
define_key(google_calendar_keymap, "s", null, $fallthrough);
define_key(google_calendar_keymap, "C-c s", "save");
define_key(google_calendar_keymap, "u", null, $fallthrough);
define_key(google_calendar_keymap, "C-c u", "up");
define_key(google_calendar_keymap, "return", null, $fallthrough);
define_key(google_calendar_keymap, "tab", null, $fallthrough);
define_key(google_calendar_keymap, "M-s", null, $fallthrough);
define_key(google_calendar_keymap, "escape", null, $fallthrough);

define_page_mode("google_calendar_mode",
                 $display_name = "Google Calendar",
                 $keymaps = {normal_input_mode: google_calendar_keymap});

var google_calendar_re = build_url_regex($domain = "google",
                                         $path   = "calendar/",
                                         $allow_www = true);
auto_mode_list.push([google_calendar_re, google_calendar_mode]);
