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
import { useQuery } from '@tanstack/react-query';

import UserNotification from 'util/UserNotification';
import type { SearchParams } from 'stores/PaginationTypes';
import type { EventNotification } from 'stores/event-notifications/EventNotificationsStore';
import { EventNotificationsStore } from 'stores/event-notifications/EventNotificationsStore';

type Options = {
  enabled: boolean,
}

const useEventNotifications = (searchParams: SearchParams, { enabled }: Options = { enabled: true }): {
  data: {
    elements: Array<EventNotification>,
    pagination: { total: number }
    attributes: Array<{ id: string, title: string, sortable: boolean }>
  } | undefined,
  refetch: () => void,
  isFetching: boolean,
} => {
  const { data, refetch, isFetching } = useQuery(
    ['eventNotifications', 'overview', searchParams],
    () => EventNotificationsStore.searchPaginated(
      searchParams.page,
      searchParams.pageSize,
      searchParams.query,
      { sort: searchParams?.sort.attributeId, order: searchParams?.sort.direction },
    ),
    {
      onError: (errorThrown) => {
        UserNotification.error(`Loading Event notifications failed with status: ${errorThrown}`,
          'Could not load Event notifications');
      },
      keepPreviousData: true,
      enabled,
    },
  );

  return ({
    data,
    refetch,
    isFetching,
  });
};

export default useEventNotifications;
