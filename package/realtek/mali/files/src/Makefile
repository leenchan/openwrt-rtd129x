PWD=$(shell pwd)
ifndef TOP
	TOP = ../..
endif
-include $(TOP)/make.include

all: install

install:
	$(MAKE) -C mali TARGET_KDIR=$(PWD)/$(LINUX_KERNEL_PATH)
#	$(CROSS_COMPILE)strip $(PWD)/mali/drivers/gpu/arm/midgard/mali_kbase.ko --strip-unneeded
#	$(CROSS_COMPILE)strip $(PWD)/mali/drivers/base/ump/src/imports/ion/ump_kernel_import_ion.ko --strip-unneeded
#	$(CROSS_COMPILE)strip $(PWD)/mali/drivers/base/ump/src/ump.ko --strip-unneeded
#	$(CROSS_COMPILE)strip $(PWD)/mali/drivers/base/kds/kds.ko --strip-unneeded

clean:
	$(MAKE) -C mali TARGET_KDIR=$(PWD)/$(LINUX_KERNEL_PATH) clean
