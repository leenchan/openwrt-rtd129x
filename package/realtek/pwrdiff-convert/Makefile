#
# Copyright (C) 2015-2017 Realtek
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=pwrdiff-convert
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

define Package/pwrdiff-convert
  SECTION:=Tool
  CATEGORY:=Utilities
#  DEPENDS:=+libpcap
  TITLE:=For convert wifi pwrdiff calibration data
endef

define Package/pwrdiff-convert/description
  For convert wifi pwrdiff calibration data
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/pwrdiff-convert/install
	$(INSTALL_DIR) $(1)/usr/local/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/pwrdiff-convert $(1)/usr/local/sbin/
endef

$(eval $(call BuildPackage,pwrdiff-convert))
