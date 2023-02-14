#
# Copyright (C) 2015-2016 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v3.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=supervisord
PKG_VERSION:=3.0
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://github.com/linux4sam/u-boot-at91.git
PKG_HASH:=skip

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/ochinchina/supervisord.git
PKG_SOURCE_VERSION:=b1093f8906480aac2a7c82c8fa94e1e518fd6a62
PKG_MIRROR_HASH:=skip

PKG_LICENSE:=GPL-3.0
PKG_LICENSE_FILE:=LICENSE
PKG_MAINTAINER:=ochinchina

PKG_CONFIG_DEPENDS:= \
	CONFIG_SUPERVISORD_USE_GOPROXY \
	CONFIG_SUPERVISORD_COMPRESS_UPX

PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
PKG_USE_MIPS16:=0

GO_PKG:=github.com/ochinchina/supervisord
# GO_PKG_LDFLAGS:=-w -s
GO_PKG_LDFLAGS:=-linkmode external -extldflags -static
GO_PKG_TAGS:=release

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/$(PKG_NAME)/Default
	SECTION:=admin
	CATEGORY:=Administration
	TITLE:=supervisord
	URL:=https://github.com/ochinchina/supervisord
endef

define Package/$(PKG_NAME)/description
  This project re-implements supervisord in go-lang.
endef

define Package/$(PKG_NAME)
	$(call Package/supervisord/Default)
	DEPENDS:=$(GO_ARCH_DEPENDS)
endef

define Package/$(PKG_NAME)/config
config SUPERVISORD_COMPRESS_UPX
	bool "Compress executable files with UPX"
	default n

config SUPERVISORD_USE_GOPROXY
	bool "Compiling with GOPROXY proxy"
	default n
endef

ifeq ($(CONFIG_SUPERVISORD_USE_GOPROXY),y)
	export GO111MODULE=on
	export GOPROXY=https://mirrors.aliyun.com/goproxy/
endif

define Build/Prepare
	$(call Build/Prepare/Default)
endef

define Build/Compile
	$(call GoPackage/Build/Compile)
ifneq ($(CONFIG_SUPERVISORD_COMPRESS_UPX),)
	$(STAGING_DIR_HOST)/bin/upx --lzma --best $(GO_PKG_BUILD_BIN_DIR)/supervisord
endif
endef

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(GO_PKG_BUILD_BIN_DIR)/supervisord $(1)/usr/bin
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
