
# mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
# current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

add_ons_dir := ${ROOT_DIR}

all: emails-grouper.zip

emails-grouper.zip: emails-grouper/dist/* emails-grouper/manifest.json
	echo toto${add_ons_dir} && cd emails-grouper && zip -r $(add_ons_dir)/emails-grouper.zip . --exclude src/\* --exclude node_modules/\*

emails-grouper/dist/.last_tsc_run: emails-grouper/src/*.ts
	cd emails-grouper && npx tsc

clean:
	rm -Rf emails-grouper/dist/* ; rm -Rf emails-grouper.zip
