'use strict';
'require view';
'require dom';
'require uci';
'require ui';
'require fs';
'require rpc';
'require form';
'require tools.widgets as widgets';

var app = 'qbittorrent';
var configuration = {},
	default_options = {},
	status = {};

function callInitScript(action, param) {
	return fs.exec_direct('/etc/init.d/qbittorrent', [action].concat(param ? param : []), 'json');
}

function callGetWdigetDom(s, o) {
	return document.getElementById('widget.cbid.' + app + '.' + s + '.' + o);
}

function callGetCbiDom(s, o) {
	return document.getElementById('cbi-' + app + '-' + s + '-' + o);
}

function createOnClickHandler(o) {
	return function (ev) {
		var
			btn = ev.target,
			title = btn.textContent,
			restore_btn = function () {
				setTimeout(function () {
					btn.textContent = title;
				}, 3000);
			},
			titleSuccess = o.titleSuccess ? o.titleSuccess : _('Success'),
			titleFailed = o.titleFailed ? o.titleFailed : _('Failed! Please retry.'),
			titlePending = o.titlePending ? o.titlePending : _('Pending') + '...',
			onSuccess = o.onSuccess ? function (res) {
				o.onSuccess(res, btn)
			} : function (res) {
				if (res && res.status) {
					btn.textContent = titleSuccess
				} else {
					btn.textContent = titleFailed
				}
			},
			onFailed = o.onFailed ? function (res) {
				o.onFailed(res, btn)
			} : function (error) {
				btn.textContent = error
			};
		btn.textContent = titlePending;
		if (typeof o.action == 'function') {
			var action = o.action();
			if (action.then) {
				action.then(onSuccess).catch(onFailed).finally(restore_btn);
			} else {
				onSuccess();
			}
		}
	}
}

function createOptions(s, t) {
	return function (options) {
		var __options = [];
		var setProps = function (o, props) {
			for (var prop in props) {
				if (prop == 'values') {
					for (var key in props['values']) {
						o.value(key, props['values'][key]);
					}
				} else {
					o[prop] = props[prop];
				}
			}
		}
		var setValue = function (o, value) {
			o.cfgvalue = function () {
				if (typeof value === 'object') {
					return Object.keys(value)
				}
				return value
			}
		}
		if (!Array.isArray(options[0])) {
			options = [options];
		}
		for (var i = 0; i < options.length; i++) {
			if (Array.isArray(options[i])) {
				var name = options[i][0],
					title = options[i][1],
					dec = options[i][2],
					type = options[i][3],
					props = options[i][4];
				var o = t ? s.taboption(t, type, name, _(title), _(dec)) : s.option(type, name, title, dec);
				if (props) {
					setProps(o, props);
				}
				if (configuration[name] !== undefined) {
					setValue(o, configuration[name]);
				}
				__options.push(o);
			}
		}
		return __options;
	}
}

function getConfValue(content, name) {
	return function () {
		var regex = new RegExp('^' + name + '=');
		var value = content.filter(function (curr) {
			return regex.test(curr)
		});
		return value.length > 0 ? value[0].replace(regex, '') : undefined;
	}
}

function getCbiValue(s, o) {
	var container = document.getElementById('cbid.' + app + '.' + s + '.' + o),
		field, value;
	if (/cbi-dynlist/.test(container.className)) {
		value = [];
		field = container.querySelectorAll('input[type="hidden"]');
		for (var i = 0; i < field.length; i++) {
			if (field[i].value) {
				value.push(field[i].value);
			}
		}
	} else {
		field = container.querySelector('input, textarea, select');
		if (field && field.type == 'password' && field.nextSibling && field.nextSibling.type == 'password') {
			field = field.nextSibling;
		}
		if (field && field.type && field.type == 'checkbox') {
			value = field.checked ? true : false;
		} else if (field && field.value !== undefined) {
			value = field.value;
		}
	}
	return value;
}
return view.extend({
	load: function () {
		return Promise.all([callInitScript('get_status'), callInitScript('get_conf'), callInitScript('api', 'get_preferences'), uci.load(app)]);
	},
	render: function (data) {
		status = data[0] ? data[0] : {};
		default_options = data[1] ? data[1] : {};
		configuration = data[2] ? data[2] : {};
		var m, s, t, o, profile_dir = uci.get(app, 'config', 'profile_dir'),
			pid = status && status.pid ? status.pid : undefined,
			port = status && status.webui_port ? status.webui_port : undefined,
			changed_password = status && status.changed_password ? status.changed_password : false,
			app_version = status && status.app_version ? status.app_version : undefined,
			button_webui = E('a', {
				'class': 'btn cbi-button-action',
				'href': '//' + window.location.hostname + ':' + port,
				'target': '_blank'
			}, _("WebUI")).outerHTML;
		var binList = {};
		status.bin_path.forEach(function(_bin) { binList[_bin] = _bin; })

		function restart(ev) {
			createOnClickHandler({
				action: function () {
					return callInitScript('restart');
				}
			})(ev);
		}

		function resetProfile(ev) {
			createOnClickHandler({
				action: function () {
					return callInitScript('reset');
				}
			})(ev);
		}

		function installRelease(edition, ev) {
			createOnClickHandler({
				action: function () {
					return callInitScript('install', [edition]);
				},
				onSuccess: function (res, btn) {
					if (res && res.status && res.status === true) {
						window.location.reload();
					}
				}
			})(ev);
		}

		function resetPassword(ev) {
			createOnClickHandler({
				action: function () {
					return callInitScript('reset_password');
				},
				onSuccess: function (res, btn) {
					if (res && res.status && res.status === true) {
						callGetWdigetDom('config', 'web_ui_password').value = default_options['webui_password'];
						callGetCbiDom('config', 'web_ui_password_reset').outerHTML = '';
					}
				}
			})(ev);
		}

		function updateTrackersList(ev) {
			createOnClickHandler({
				action: function () {
					var dom_trackers = callGetWdigetDom('config', 'trackerslist'),
						trackers;
					// if (dom_trackers && dom_trackers.value) {
					// 	// trackers = dom_trackers.value.replace(/(\n)+/g, '\n');
					// 	dom_trackers.value = dom_trackers.value;
					// }
					return callInitScript('update_trackerslist', [dom_trackers.value]);
				},
				onSuccess: function (res, btn) {
					if (res && res.status && res.status === true) {
						btn.textContent = 'Success update ' + res.count + ' trackers.'
					}
				}
			})(ev);
		}

		function setPreferences(ev) {
			createOnClickHandler({
				action: function () {
					var values = {};
					var preferences = [];
					s_preferences.children.forEach(function (item) {
						if (/^[a-z]/.test(item.option)) {
							preferences.push(item.option)
						}
					});
					for (var i = 0; i < preferences.length; i++) {
						var value = getCbiValue('config', preferences[i]);
						if (value !== undefined) {
							if (Array.isArray(value)) {
								var _value = {};
								value.forEach(function (item) {
									_value[item] = 0;
								});
								values[preferences[i]] = _value;
							} else {
								values[preferences[i]] = value;
							}
						}
					}
					return callInitScript('api', ['set_preferences', JSON.stringify(values)]);
				}
			})(ev);
		}

		m = new form.Map('qbittorrent', [_('qBittorrent')], '<br>qBittorrent' + (app_version ? '(' + app_version + ') ' : ' ') + (pid ? _('is running') + (port && ' ' + button_webui) : _('is not running')));
		var s_basic = m.section(form.NamedSection, 'config', 'qbittorrent');
		var o_basic = createOptions(s_basic)([
			['enabled', _('Enabled'), '', form.Flag, {
				default: default_options['enabled'],
				rmempty: false
			}],
			['bin_path', _('Path'), _('default: /usr/bin/qbittorrent-nox'), form.Value, {
				default: default_options['path'],
				datatype: 'file',
				placeholder: '/usr/bin/qbittorrent-nox',
				values: binList,
				rmempty: true
			}],
			['_', _('Install'), '', form.DummyValue, {
				cfgvalue: function(section_id) {
					return E('div', {}, [
						E('button', { 'class': 'btn cbi-button-save', 'click': installRelease.bind(this, 'normal') }, _('Normal')),
						E('button', { 'class': 'btn cbi-button-save', 'click': installRelease.bind(this, 'enhanced') }, _('Enhanced'))
					]);
				}
			}],
			['run_as_user', _('Run As User'), '', widgets.UserSelect, {
				default: default_options['run_as_user'],
				rmempty: false
			}],
			['webui_port', _('WebUI Port'), '', form.Value, {
				default: default_options['webui_port'],
				datatype: 'port',
				rmempty: false
			}],
			['profile_dir', _('Profile Directory'), '', form.Value, {
				default: default_options['profile_dir'],
				datatype: 'string',
				rmempty: false
			}],
		]);
		fs.stat(profile_dir).then(function (res) {
			if (res && res.type == 'directory') {
				createOptions(s_basic)(['_', ' ', '', form.Button, {
					inputtitle: _('Reset qBittorrent'),
					inputstyle: 'remove',
					onclick: resetProfile
				}]);
			}
		});
		if (pid && configuration) {
			var s_preferences = m.section(form.NamedSection, 'config', 'qbittorrent', _('Preferences'));
				if (configuration.code == 403) {
					createOptions(s_preferences)([
						['_', ' ', configuration.error ? configuration.error : _('Forbidden! Please restart qBittorrent.'), form.Button, {
							inputtitle: _('Restart'),
							onclick: restart
						}]
					]);
			} else {
				t = s_preferences.tab('webui', _('WebUI'));
				var o_webui = createOptions(s_preferences, 'webui')([
					['locale', _('Language'), '', form.ListValue, {
						values: {
							'en': 'English',
							'zh': '简体中文'
						},
						default: 'en'
					}],
					['web_ui_session_timeout', _('Session Timeout'), '', form.Value],
					['web_ui_username', _('Username'), '', form.Value, {
						default: default_options['webui_username']
					}],
					['web_ui_password', _('Password'), '', form.Value, {
						password: true,
						default: default_options['webui_password']
					}],
					['web_ui_password_reset', ' ', '', form.Button, {
						inputtitle: _('Reset Password'),
						inputstyle: 'remove',
						onclick: resetPassword
					}],
					['bypass_local_auth', _('Authentication'), _('Bypass authentication for clients on localhost'), form.Flag],
					['bypass_auth_subnet_whitelist_enabled', ' ', _('Bypass authentication for clients in whitelisted IP subnets'), form.Flag],
					['bypass_auth_subnet_whitelist', ' ', '', form.TextValue, {
						placeholder: 'eg. 172.17.32.0/24, fdff:ffff:c8::/40',
						rows: 4
					}],
					['web_ui_host_header_validation_enabled', _('Validation'), _('Enable Host header validation'), form.Flag],
					['web_ui_domain_list', ' ', '', form.TextValue, {
						placeholder: 'eg. a.com, b.com, c.com',
						rows: 4
					}],
					['alternative_webui_enabled', ' ', _('Use Alternative WebUI'), form.Flag],
					['alternative_webui_path', ' ', '', form.Value, {
						datatype: 'directory'
					}],
				]);
				fs.lines(profile_dir + '/qBittorrent/config/qBittorrent-extra.conf').then(function (res) {
					o_webui[3].cfgvalue = getConfValue(res, 'WebUI\\\\Password');
				});
				t = s_preferences.tab('download', _('Download'));
				var o_download = createOptions(s_preferences, 'download')([
					['save_path', _('Download Directory'), '', form.Value],
					['scan_dirs', _('Automatically Add Torrents From'), '', form.DynamicList, {
						datatype: 'string'
					}],
					['max_active_downloads', _('Maximum Active Downloads'), '', form.Value, {
						datatype: 'uinteger'
					}],
					['max_active_torrents', _('Maximum Active Torrents'), '', form.Value, {
						datatype: 'uinteger'
					}],
					['dl_limit', _('Global Download Limit'), _('KiB/s, 0 means unlimited'), form.Value, {
						datatype: 'uinteger'
					}],
					['autorun_enabled', _('Torrent Completion'), _('Run external program on torrent completion'), form.Flag],
					['autorun_program', ' ', _('%N: Torrent name / %L: Category / %G: Tags (separated by comma) / %F: Content path (same as root path for multifile torrent) / %R: Root path (first torrent subdirectory path) / %D: Save path / %C: Number of files / %Z: Torrent size (bytes) / %T: Current tracker / %I: Info hash'), form.TextValue, {
						placeholder: 'e.g., echo "[%L] %N (%D)" > /tmp/qbittorrent.log',
						rows: 2
					}],
				]);
				t = s_preferences.tab('upload', _('Upload'));
				var o_upload = createOptions(s_preferences, 'upload')([
					['max_active_uploads', _('Maximum Active Uploads'), '', form.Value, {
						datatype: 'uinteger'
					}],
					['up_limit', _('Global Upload Limit'), _('KiB/s, 0 means unlimited'), form.Value, {
						datatype: 'uinteger'
					}],
					['max_ratio_enabled', _('Stop Seeding'), _('When ratio reaches'), form.Flag],
					['max_ratio', ' ', '', form.Value, {
						datatype: 'float'
					}],
					['max_seeding_time_enabled', ' ', _('When seeding time reaches'), form.Flag],
					['max_seeding_time', ' ', '', form.Value, {
						datatype: 'integer'
					}],
					['max_ratio_act', _('Stop Action'), '', form.ListValue, {
						values: {
							'0': _('Pause torrent'),
							'1': _('Remove torrent'),
							'3': _('Remove torrent and its files'),
							'2': _('Enable super seeding for torrent'),
						},
						default: '0'
					}]
				]);
				t = s_preferences.tab('trackers', _('Trackers'));
				var o_trackers = createOptions(s_preferences, 'trackers')([
					['trackerslist', _('BT Trackers'), _('one tracker / list per line'), form.TextValue, {
						placeholder: 'eg. http://localhost:8000/announce or http://localhost/trackerslist.txt',
						rows: 4
					}],
					['_', ' ', '', form.Button, {
						inputtitle: _('Update'),
						inputstyle: 'save',
						onclick: updateTrackersList
					}],
					['add_trackers_enabled', ' ', _('Automatically add these trackers to new downloads'), form.Flag],
					['announce_to_all_trackers', ' ', _('Always announce to all trackers in a tier'), form.Flag],
					['announce_to_all_tiers', ' ', _('Always announce to all tiers'), form.Flag]
				]);
				var s_preferences_actions = m.section(form.NamedSection, 'config', 'qbittorrent', " ");
				var s_preferences_action = s;
				var o_preferences_actions = createOptions(s_preferences_actions)(['_', '', '', form.Button, {
					inputstyle: 'apply',
					inputtitle: _('Apply Preferences'),
					onclick: setPreferences
				}]);
			}
		}
		return m.render();
	}
});
