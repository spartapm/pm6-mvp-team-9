"use client";

import posthog from "posthog-js";
import { isPostHogEnabled, POSTHOG_HOST, POSTHOG_KEY } from "@/lib/posthog-config";

type PostHogProperties = Record<string, string | number | boolean | null | undefined>;

let initialized = false;

export function initPostHog() {
  if (!isPostHogEnabled() || typeof window === "undefined" || initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export function capturePostHogEvent(event: string, properties?: PostHogProperties) {
  if (!isPostHogEnabled()) return;
  initPostHog();
  posthog.capture(event, properties);
}

export function identifyPostHogUser(
  distinctId: string,
  properties?: PostHogProperties,
) {
  if (!isPostHogEnabled()) return;
  initPostHog();
  posthog.identify(distinctId, properties);
}

export function resetPostHogUser() {
  if (!isPostHogEnabled() || !initialized) return;
  posthog.reset();
}

export function capturePostHogPageView(url: string) {
  capturePostHogEvent("$pageview", { $current_url: url });
}
