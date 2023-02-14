/*
 *
 * (C) COPYRIGHT 2010-2011, 2013 ARM Limited. All rights reserved.
 *
 * This program is free software and is provided to you under the terms of the
 * GNU General Public License version 2 as published by the Free Software
 * Foundation, and any use by you of this program is subject to the terms
 * of such GNU licence.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, you can access it online at
 * http://www.gnu.org/licenses/gpl-2.0.html.
 *
 * SPDX-License-Identifier: GPL-2.0
 *
 */



#ifndef _UMP_ARCH_H_
#define _UMP_ARCH_H_

#include <common/ump_kernel_core.h>

/**
 * Device specific setup.
 * Called by the UMP core code to to host OS/device specific setup.
 * Typical use case is device node creation for talking to user space.
 * @return UMP_OK on success, any other value on failure
 */
extern ump_result umpp_device_initialize(void);

/**
 * Device specific teardown.
 * Undo any things done by ump_device_initialize.
 */
extern void umpp_device_terminate(void);

extern int umpp_phys_commit(umpp_allocation * alloc);
extern void umpp_phys_free(umpp_allocation * alloc);

#endif /* _UMP_ARCH_H_ */
