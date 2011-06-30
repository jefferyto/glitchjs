# shamelessly stolen/adapted from jQuery

SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglifyjs
POST_COMPILER = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

G = ${DIST_DIR}/glitch.js\
	${DIST_DIR}/jquery.glitch.js

G_MIN = ${DIST_DIR}/glitch.min.js\
	${DIST_DIR}/jquery.glitch.min.js

G_DOC = GPL-LICENSE.txt\
	MIT-LICENSE.txt\
	README.md

G_VER = $(shell cat version.txt)
VER = sed "s/@VERSION/${G_VER}/"

#DATE = $(shell git log -1 --pretty=format:%ad)
DATE = dummydate

all: glitch min

${DIST_DIR}:
	mkdir -p ${DIST_DIR}

glitch: ${G}

${DIST_DIR}/%.js: ${SRC_DIR}/%.js | ${DIST_DIR}
	cat $< | sed 's/@DATE/'"${DATE}"'/' | ${VER} > $@

min: glitch ${G_MIN}

${DIST_DIR}/%.min.js: ${DIST_DIR}/%.js
	if test ! -z ${JS_ENGINE}; then \
		${COMPILER} $< > $@.tmp; \
		${POST_COMPILER} $@.tmp > $@; \
		rm -f $@.tmp; \
	else \
		echo "You must have NodeJS installed in order to minify Glitch."; \
	fi

clean:
	rm -rf ${DIST_DIR}

zip: ${G} ${G_MIN} ${G_DOC}
	zip -j -9 - $^ > ${DIST_DIR}/glitch-${G_VER}.zip

.PHONY: all glitch min zip clean

