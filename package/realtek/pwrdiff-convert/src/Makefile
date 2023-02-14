all: pwrdiff-convert

pwrdiff-convert: pwrdiff-convert.c
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^ $(LDLIBS)

clean:
	rm -f *.o pwrdiff-convert

.PHONY: all clean
