-- Pagination & multi-action filter perf for governance_events
CREATE INDEX IF NOT EXISTS idx_governance_events_created_at_desc
  ON public.governance_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_governance_events_target_entity_type
  ON public.governance_events (target_entity_type);

CREATE INDEX IF NOT EXISTS idx_governance_events_event_action
  ON public.governance_events (event_action);

CREATE INDEX IF NOT EXISTS idx_governance_events_actor_id
  ON public.governance_events (actor_id);

-- Composite for the most common admin query pattern (protocol pagination)
CREATE INDEX IF NOT EXISTS idx_governance_events_protocol_paginated
  ON public.governance_events (target_entity_type, event_action, created_at DESC);

-- Functional index for server-side request_id search inside context jsonb
CREATE INDEX IF NOT EXISTS idx_governance_events_context_request_id
  ON public.governance_events ((context->>'request_id'));