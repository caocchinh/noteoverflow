'use client';

import {
  Content as CollapsiblePrimitiveContent,
  Root as CollapsiblePrimitiveRoot,
  Trigger as CollapsiblePrimitiveTrigger,
} from '@radix-ui/react-collapsible';

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitiveRoot>) {
  return <CollapsiblePrimitiveRoot data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitiveTrigger>) {
  return (
    <CollapsiblePrimitiveTrigger data-slot="collapsible-trigger" {...props} />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitiveContent>) {
  return (
    <CollapsiblePrimitiveContent data-slot="collapsible-content" {...props} />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
