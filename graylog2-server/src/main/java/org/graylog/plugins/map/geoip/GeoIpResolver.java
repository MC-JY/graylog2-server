/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */

package org.graylog.plugins.map.geoip;

import com.codahale.metrics.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.InetAddress;
import java.nio.file.Files;
import java.util.Optional;

public abstract class GeoIpResolver<V> {

    private static final Logger LOG = LoggerFactory.getLogger(GeoIpResolver.class);

    protected final Timer resolveTime;
    private final boolean enabled;

    GeoIpResolver(Timer resolveTime, String configPath, boolean enabled) {

        this.resolveTime = resolveTime;
        if (enabled) {
            final File configFile = new File(configPath);
            if (Files.exists(configFile.toPath())) {
                this.enabled = createDataProvider(configFile);
            } else {
                LOG.warn("'{}' database file does not exist: {}", getClass().getName(), configPath);
                this.enabled = false;
            }
        } else {
            this.enabled = false;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    abstract boolean createDataProvider(File configFile);

    public Optional<V> getGeoIpData(InetAddress address) {
        if (!enabled || address == null) {
            return Optional.empty();
        }

        return doGetGeoIpData(address);
    }

    protected abstract Optional<V> doGetGeoIpData(InetAddress address);
}