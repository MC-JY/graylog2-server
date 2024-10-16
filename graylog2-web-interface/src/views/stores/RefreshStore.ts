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
import Reflux from 'reflux';

import { singletonActions, singletonStore } from 'logic/singleton';

type RefreshActionsType = {
  enable: () => void,
  disable: () => void,
  setInterval: (interval: number) => void,
  refresh: () => Promise<unknown>,
};

export const RefreshActions = singletonActions(
  'views.Refresh',
  () => Reflux.createActions<RefreshActionsType>({
    enable: { asyncResult: true },
    disable: { asyncResult: true },
    setInterval: { asyncResult: true },
    refresh: { asyncResult: true },
  }),
);

type RefreshConfig = {
  interval: number,
  enabled: boolean,
};

export const RefreshStore = singletonStore(
  'views.Refresh',
  () => Reflux.createStore<RefreshConfig>({
    listenables: [RefreshActions],

    refreshConfig: {},

    intervalId: undefined,

    init() {
      this.refreshConfig = {
        enabled: false,
        interval: 5000,
      };
    },

    getInitialState() {
      return this.refreshConfig;
    },

    _scheduleRefresh() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      if (this.refreshConfig.enabled) {
        return setTimeout(async () => {
          await RefreshActions.refresh();
          this.intervalId = this._scheduleRefresh();
        }, this.refreshConfig.interval);
      }

      return undefined;
    },

    setInterval(interval: number) {
      this.refreshConfig = { interval, enabled: true };

      this.intervalId = this._scheduleRefresh();
      this._trigger();
    },

    enable() {
      this.refreshConfig = { ...this.refreshConfig, enabled: true };

      this.intervalId = this._scheduleRefresh();

      this._trigger();
    },

    disable() {
      this.refreshConfig = { ...this.refreshConfig, enabled: false };

      this.intervalId = this._scheduleRefresh();

      this._trigger();
    },

    _trigger() {
      const { enabled, interval } = this.refreshConfig;

      this.trigger({ enabled, interval });
    },
  }),
);
