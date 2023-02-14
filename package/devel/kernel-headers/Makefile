include $(TOPDIR)/rules.mk

# Be sure to sync version with kernel version

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=kernel-headers
PKG_VERSION:=$(LINUX_VERSION)-$(LINUX_RELEASE)-$(LINUX_VERMAGIC)
PKG_RELEASE:=1

define Package/$(PKG_NAME)
  SECTION:=devel
  CATEGORY:=Development
  TITLE:=kernel-headers (Development headers)
  DEPENDS:=+libncursesw +xz +coreutils-whoami +libelf
  URL:=http://www.kernel.org/
endef

define Package/$(PKG_NAME)/description
  kernel-headers files for development
endef

# Prepare, Configure, Compile already done by kernel depends
define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

# Fails on libtinfo.so.5 dependency. Disable dependency checking

#define CheckDependencies
#endef

# Determine gcc version
GCC_VERSION:=$(call qstrip,$(CONFIG_GCC_VERSION))
# Same version as in feeds/packages/devel/gcc/Makefile
GCC_VER:=$(firstword $(subst +, ,$(GCC_VERSION)))
# GCC_VER:=7.5.0

define Package/$(PKG_NAME)/install
	echo INSTALL_DIR: /usr/src/linux-$(LINUX_VERSION)
	echo SRC_DIR: $(LINUX_DIR)/
	echo STDARG_LOCATION: /usr/gcc-$(GCC_VER)/lib/gcc/$(REAL_GNU_TARGET_NAME)/$(GCC_VER)/include/stdarg.h
	echo STDARG_LINK: /usr/src/linux-$(LINUX_VERSION)/include/stdarg.h
	$(INSTALL_DIR) $(1)/usr/src/linux-$(LINUX_VERSION)
	cp $(LINUX_DIR)/.config $(1)/usr/src/linux-$(LINUX_VERSION)
	$(CP) $(LINUX_DIR)/* $(1)/usr/src/linux-$(LINUX_VERSION)
endef

define Package/$(PKG_NAME)/postinst
	#!/bin/sh
	# Some compiles fail without this link to stdarg.h
	ln -sf /usr/lib/gcc/$(REAL_GNU_TARGET_NAME)/$(GCC_VER)/include/stdarg.h /usr/src/linux-$(LINUX_VERSION)/include/stdarg.h
	ln -sf /usr/src/linux-$(LINUX_VERSION) /lib/modules/$(LINUX_VERSION)/build
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
