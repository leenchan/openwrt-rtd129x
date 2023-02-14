#
# Copyright (C) 2007-2011 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=rtwpriv
PKG_VERSION:=5.2
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=local
TARGET_SOURCE_URL:=./files/
TARGET_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz

include $(INCLUDE_DIR)/package.mk

define Package/rtwpriv
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Realtek WiFi Config utility
  DEPENDS:=
endef

define Package/rtwpriv/description
	Realtek wifi configuration tool
endef

define Build/Compile
endef

define Package/rtwpriv/install
	$(INSTALL_DIR) $(1)/usr/bin
	tar -C $(1) -Jxf $(TARGET_SOURCE_URL)/$(TARGET_SOURCE)
endef

$(eval $(call BuildPackage,rtwpriv))
