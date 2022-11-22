FROM node:14

# This image is intended to be use in a private virtual network
# along side other services in the PASS docker stack, this port
# will be exposed to other services, but not the host machine
ENV EMBER_PORT=${EMBER_PORT:-81}
ENV PATH $PATH:/usr/local/lib/node_modules

# Expose Ember port and hot-reload related ports
EXPOSE 7020 7357 $EMBER_PORT

# Install watchman build dependencies
RUN \
	apt-get update -y &&\
	apt-get install -y python-dev

# install watchman
# Note: See the README.md to find out how to increase the
# fs.inotify.max_user_watches value so that watchman will
# work better with ember projects.
RUN \
	git clone --branch=v4.9.0 --depth=1 https://github.com/facebook/watchman.git &&\
	cd watchman && \
	./autogen.sh && \
	CXXFLAGS=-Wno-error ./configure && \
	make && \
	make install

RUN npm install -g ember-cli@3.20 \
    && ember -v

WORKDIR /passapp

# Run 'ember server' on container start
CMD ember server --port $EMBER_PORT
