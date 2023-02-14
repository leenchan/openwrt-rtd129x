include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-wan-auto-switch
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=LuCI support for WAN Auto-Switch
LUCI_DEPENDS:=+pppoe-discovery
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature