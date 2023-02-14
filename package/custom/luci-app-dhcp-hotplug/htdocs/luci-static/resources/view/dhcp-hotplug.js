'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require fs';
'require ui';
'require uci';
'require form';
'require network';
'require validation';

var log_path = '/var/log/dhcp-hotplug.txt';

var callHostHints;

callHostHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getHostHints',
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			callHostHints()
		]);
	},

	render: function(hosts_duids_pools) {
		var hosts = hosts_duids_pools[0];

		var m, s, o;
		m = new form.Map('dhcp-hotplug', _('DHCP Hotplug'));

		s = m.section(form.TypedSection, 'general');
		s.tab('general', _('General'));
		s.anonymous = true;
		o = s.taboption('general', form.Flag, 'enable', _('Enable'));
		s.tab('log', _('Log'));
		var log_textarea = E('div', { 'id': 'log_textarea', 'style': 'text-align: center; font-size: 12px; line-height: 2;' },
			E('img', {
							'src': L.resource(['icons/loading.gif']),
							'alt': _('Loading...'),
							'style': 'vertical-align:middle; width: 32px; height: 32px; display: inline-block;'
			}, _('Collecting data...'))
		);
		o = s.taboption('log', form.DummyValue, '_');
		o.cfgvalue = function() {
			return log_textarea;
		};
		o.write = function() {};

		s = m.section(form.GridSection, 'dhcp_client', _('DHCP Clients'));
		s.anonymous = true;
		s.addremove = true;
		s.sortable = true;
		s.addbtntitle = _('Add');

		o = s.option(form.Value, 'name', _('Name'));

		o = s.option(form.DynamicList, 'mac', _('MAC'));
		o.datatype = 'list(macaddr)';
		Object.keys(hosts).forEach(function(mac) {
			var hint = hosts[mac].name || L.toArray(hosts[mac].ipaddrs || hosts[mac].ipv4)[0];
			o.value(mac, hint ? '%s (%s)'.format(mac, hint) : mac);
		});

		o = s.option(form.DynamicList, 'ip', _('IP'));
		o.datatype = 'list(ip4addr)';
		Object.values(hosts).filter(function(mac) {return mac.ipaddrs && mac.ipaddrs.length >= 1}).forEach(function(mac) {
			var ip = mac.ipaddrs[0];
			o.value(ip, mac.name ? '%s (%s)'.format(ip, mac.name) : ip);
		});


		o = s.option(form.TextValue, 'run', null, _("env: $ACTION (add | update | remove)  $MACADDR  $IPADDR  $HOSTNAME"));
		o.modalonly = true;
		o.placeholder = 'script runs when DHCP Client connected / disconnected'

		o = s.option(form.Flag, 'enable', _('Enable'));
		o.modalonly = false;
		o.editable = true;

		return m.render().then(L.bind(function(m, nodes) {
			poll.add(L.bind(function() {
				return Promise.all([
					fs.read_direct(log_path)
				]).then(function(data) {
					if (data[0].trim() == '') {
						throw 'No Data';
					}
					// .replace(/(([a-zA-Z0-9]{2}:){5}[a-zA-Z0-9]{2})/ig, '<a href="https://api.macvendors.com/$1" target="_blank">$1</a>')
					const log_records = data[0].split('\n').filter(r => r != '').reverse().join('<br>');
					if (log_records == log_textarea.childNodes[0].innerHTML) {
						return;
					}
					var scrollTop = log_textarea.childNodes[0].scrollTop;
					dom.content(log_textarea, E('div', {style: 'padding-top: 16px; padding-bottom: 16px; max-height: 320px; overflow: auto; text-align: left;'}, log_records));
					log_textarea.childNodes[0].scrollTo(0, scrollTop);
				}).catch(function(e) {
					dom.content(log_textarea, E('div', {style: 'padding: 32px;'}, e + ' (log_file: ' + log_path + ')'));
				});
			}, this), 5);
			return nodes;
		}, this, m));
	}
});
