#
# Copyright (C) 2010-2011 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=auto-mount
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/auto-mount
  TITLE:=Auto-mount block device.
  MAINTAINER:=Leen
  DEPENDS:= +block-mount
endef

define Build/Compile
endef

define Package/auto-mount/install
	$(INSTALL_DIR) $(1)/etc/hotplug.d/block
	$(INSTALL_BIN) ./files/15-auto-mount $(1)/etc/hotplug.d/block/
endef

$(eval $(call BuildPackage,auto-mount))
