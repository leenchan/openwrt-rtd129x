#
# Copyright (C) 2014-2016 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=mali
PKG_RELEASE=3

# PKG_SOURCE:=mali
# PKG_SOURCE_URL:=./files/src
# PKG_SOURCE_PROTO:=local

GPU_ARCH:=midgard
PKG_VERSION:=r23p0

include $(INCLUDE_DIR)/kernel.mk
include $(INCLUDE_DIR)/package.mk

# PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

define KernelPackage/mali
  SUBMENU:=GPU Drivers
  TITLE:=ARM Mali GPU driver
  DEPENDS:=@TARGET_realtek&&!RTK_KERNEL_4_4_18
endef

define KernelPackage/mali/realtek/rtd129x
  FILES:=$(PKG_BUILD_DIR)/mali/drivers/gpu/arm/midgard/mali_kbase.ko \
		 $(PKG_BUILD_DIR)/mali/drivers/base/dma_buf_test_exporter/dma-buf-test-exporter.ko \
		 $(PKG_BUILD_DIR)/mali/drivers/gpu/arm/midgard/tests/kutf/kutf.ko
  AUTOLOAD:=$(call AutoLoad,50,mali_kbase dma-buf-test-exporter.ko kutf.ko)
endef

define KernelPackage/mali/realtek/rtd16xx
  FILES:=$(PKG_BUILD_DIR)/driver/product/kernel/drivers/gpu/arm/midgard/mali_kbase.ko \
		 $(PKG_BUILD_DIR)/driver/product/kernel/drivers/base/dma_buf_test_exporter/dma-buf-test-exporter.ko \
		 $(PKG_BUILD_DIR)/driver/product/kernel/drivers/gpu/arm/midgard/tests/kutf/kutf.ko
  AUTOLOAD:=$(call AutoLoad,50,mali_kbase dma-buf-test-exporter.ko kutf.ko)
endef

define Build/Prepare
	$(CP) ./files/src/* $(PKG_BUILD_DIR)/
	$(SED) '/make.include/d' $(PKG_BUILD_DIR)/Makefile
endef

MAKE_FLAGS = \
	ARCH=arm64 \
	CROSS_COMPILE="$(TARGET_CROSS)" \
	LINUX_KERNEL_PATH="../linux-$(LINUX_VERSION)"

$(eval $(call KernelPackage,mali))
