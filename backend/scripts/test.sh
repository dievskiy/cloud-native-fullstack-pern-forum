#!/usr/bin/env bash

echo -n "Start testing..."
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit \
 && echo 'Tests completed successfully!'; \
  docker-compose down -v