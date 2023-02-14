'use strict';
'require view';
'require dom';
'require poll';
'require fs';
'require ui';
'require uci';
'require form';
'require network';

var log_path = '/var/log/wan-auto-switch.txt';

return view.extend({
	load: function() {
	},

	render: function() {
		var m, s, o;
		m = new form.Map('wan-auto-switch', _('WAN Auto-Switch'));

		s = m.section(form.TypedSection, 'general');
		s.tab('general', _('General'));
		s.anonymous = true;
		o = s.taboption('general', form.Flag, 'enable', _('Enable'));
		o = s.taboption('general', form.Value, 'timeout', _('Timeout'));
		o.datatype = 'and(uinteger,range(1,10))';
		o.default = 1;
		o = s.taboption('general', form.Button, '_', ' ');
		o.inputtitle = _('Restart WAN');
		o.inputstyle = 'apply';
		o.onclick = function(e) {
			fs.exec_direct('/etc/hotplug.d/iface/10-wan-auto-switch', ['restart']).then(function(res) {console.log(res)}).catch();
		};
		o.write = function(){};
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

		s = m.section(form.GridSection, 'mode', _('WAN Protocol Templates'));
		s.anonymous = true;
		s.addremove = true;
		s.sortable = true;
		s.addbtntitle = _('Add Template');
		s.option(form.Value, 'name', _('Name')).modalonly = false;
		s.option(form.Value, 'proto', _('Protocol')).modalonly = false;
		o = s.option(form.Flag, 'enable', _('Enable'));
		o.modalonly = false;
		o.editable = true;

		o = s.option(form.Value, 'name', _('Name'), _(''));
		o.placeholder = _('Name (optional)');
		o.optional = true;
		o.modalonly = true;

		o = s.option(form.ListValue, 'proto', _('Protocol'), _(''));
		o.value('pppoe', 'PPPoE');
		o.value('dhcp', 'DHCP');
		o.value('static', 'Static Address');
		o.modalonly = true;

		o = s.option(form.Value, 'username', _('Username'), _(''));
		o.depends('proto', 'pppoe');
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.Value, 'password', _('Password'), _(''));
		o.depends('proto', 'pppoe');
		o.password = true;
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.Value, 'ipv4_address', _('IPv4 Address'), _(''));
		o.depends('proto', 'static');
		o.datatype = 'ip4addr';
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.Value, 'ipv4_gateway', _('IPv4 Gateway'), _(''));
		o.depends('proto', 'static');
		o.datatype = 'ip4addr';
		o.rmempty = false;
		o.modalonly = true;

		o = s.option(form.Value, 'ipv4_netmask', _('IPv4 Netmask'), _(''));
		o.depends('proto', 'static');
		o.datatype = 'ip4addr';
		o.placeholder = '255.255.255.0';
		o.modalonly = true;

		return m.render().then(L.bind(function(m, nodes) {
			poll.add(L.bind(function() {
				return Promise.all([
					fs.read_direct(log_path)
				]).then(function(data) {
					const log_records = data[0].split('\n').filter(r => r != '').reverse().join('<br />');
					dom.content(log_textarea, E('div', {style: 'padding-top: 16px; padding-bottom: 16px; max-height: 320px; overflow: auto; text-align: left;'}, log_records));
				}).catch(function(e) {
					dom.content(log_textarea, E('div', {style: 'padding: 32px;'}, e + ' (log_file: ' + log_path + ')'));
				});
			}, this), 5);
			return nodes;
		}, this, m));
	}
});
