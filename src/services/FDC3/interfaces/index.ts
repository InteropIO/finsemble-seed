/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2019 FINOS FDC3 contributors - see NOTICE file
 */

type Context = object;
type ContextHandler = (context: Context) => void;

const enum OpenError {
  AppNotFound = "AppNotFound",
  ErrorOnLaunch = "ErrorOnLaunch",
  AppTimeout = "AppTimeout",
  ResolverUnavailable = "ResolverUnavailable"
}

const enum ResolveError {
  NoAppsFound = "NoAppsFound",
  ResolverUnavailable = "ResolverUnavailable",
  ResolverTimeout = "ResolverTimeout"
}

const enum ChannelError {
  NoChannelFound = "NoChannelFound",
  AccessDenied = "AccessDenied",
  CreationFailed = "CreationFailed"
}

declare const fdc3: DesktopAgent