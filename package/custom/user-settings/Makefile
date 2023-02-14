#
# Copyright (C) 2010-2011 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=user-settings
PKG_VERSION:=1
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
  SECTION:=Custom
  CATEGORY:=Extra packages
  TITLE:=User Settings
  MAINTAINER:=leen
  PKGARCH:=all
endef

define Package/$(PKG_NAME)/conffiles
/etc/config/
/etc/nginx/
endef

define Build/Prepare
	# chmod -R +x ./files/etc/rc.d ./files/etc/uci-defaults >/dev/null || true
endef

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/usr/share/build
	$(CP) $(TOPDIR)/.config $1/usr/share/build/
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
