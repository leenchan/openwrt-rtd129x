/*
* Copyright (C) 2015-2017 Realtek
*
* This is free software, licensed under the GNU General Public License v2.
* See /LICENSE for more information.
*
*/

#include <sys/mount.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <net/if.h>
#include <netinet/ip.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <sched.h>
#include <signal.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>

#define MAX_5G_DIFF_NUM			14
#define MAX_5G_CHANNEL_NUM_MIB		196

#define B1_G1	40
#define B1_G2	48

#define B2_G1	56
#define B2_G2	64

#define B3_G1	104
#define B3_G2	112
#define B3_G3	120
#define B3_G4	128
#define B3_G5	136
#define B3_G6	144

#define B4_G1	153
#define B4_G2	161
#define B4_G3	169
#define B4_G4	177

static int hex_to_string(unsigned char *hex,char *str,int len)
{
	int i;
	char *d,*s;
	const static char hexdig[] = "0123456789abcdef";
	if(hex == NULL||str == NULL)
		return -1;
	d = str;
	s = hex;
	
	for(i = 0;i < len;i++,s++){
		*d++ = hexdig[(*s >> 4) & 0xf];
		*d++ = hexdig[*s & 0xf];
	}
	*d = 0;
	return 0;
}

static int _is_hex(char c)
{
    return (((c >= '0') && (c <= '9')) ||
            ((c >= 'A') && (c <= 'F')) ||
            ((c >= 'a') && (c <= 'f')));
}

static int string_to_hex(char *string, unsigned char *key, int len)
{
	char tmpBuf[4];
	int idx, ii=0;
	for (idx=0; idx<len; idx+=2) {
		tmpBuf[0] = string[idx];
		tmpBuf[1] = string[idx+1];
		tmpBuf[2] = 0;
		if ( !_is_hex(tmpBuf[0]) || !_is_hex(tmpBuf[1]))
			return 0;

		key[ii++] = (unsigned char) strtol(tmpBuf, (char**)NULL, 16);
	}
	return 1;
}

void assign_diff_AC(unsigned char* pMib, unsigned char* pVal)
{
	int x=0, y=0;

	memset((pMib+35), pVal[0], (B1_G1-35));
	memset((pMib+B1_G1), pVal[1], (B1_G2-B1_G1));
	memset((pMib+B1_G2), pVal[2], (B2_G1-B1_G2));
	memset((pMib+B2_G1), pVal[3], (B2_G2-B2_G1));
	memset((pMib+B2_G2), pVal[4], (B3_G1-B2_G2));
	memset((pMib+B3_G1), pVal[5], (B3_G2-B3_G1));
	memset((pMib+B3_G2), pVal[6], (B3_G3-B3_G2));
	memset((pMib+B3_G3), pVal[7], (B3_G4-B3_G3));
	memset((pMib+B3_G4), pVal[8], (B3_G5-B3_G4));
	memset((pMib+B3_G5), pVal[9], (B3_G6-B3_G5));
	memset((pMib+B3_G6), pVal[10], (B4_G1-B3_G6));
	memset((pMib+B4_G1), pVal[11], (B4_G2-B4_G1));
	memset((pMib+B4_G2), pVal[12], (B4_G3-B4_G2));
	memset((pMib+B4_G3), pVal[13], (B4_G4-B4_G3));

}

void assign_diff_AC_hex_to_string(unsigned char* pmib,char* str,int len)
{
	unsigned char mib_buf[MAX_5G_CHANNEL_NUM_MIB];
	memset(mib_buf, 0, sizeof(mib_buf));
	assign_diff_AC(mib_buf, pmib);
	hex_to_string(mib_buf,str,MAX_5G_CHANNEL_NUM_MIB);
}



int main(int argc, char *argv[])
{
	char p[MAX_5G_CHANNEL_NUM_MIB*2+1];
	unsigned char hex[1024];

	if (argc < 2) {
		printf("error: needs 1 hex string argument with length 28!\n");
		return -1;
	}

	if (strlen(argv[1]) != 28) {
		printf("%s\n", argv[1]);
		return -1;
	}

	memset(p, 0, sizeof(p));
	string_to_hex(argv[1], hex, strlen(argv[1]));
	
	assign_diff_AC_hex_to_string(hex, p, MAX_5G_DIFF_NUM);
	printf("%s\n", p);

	return 0;
}
