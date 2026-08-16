import { blockRegistry } from "@/lib/block-registry";
import type { CmsBlock, CmsSectionSettings } from "@/lib/blocks";

const BACKGROUND_CLASS: Record<CmsSectionSettings["background"], string> = {
  default: "",
  surface: "bg-surface",
  dark: "bg-secondary",
  primary: "bg-primary",
};

const SPACING_CLASS: Record<CmsSectionSettings["spacing"], string> = {
  none: "",
  sm: "py-4",
  md: "py-8",
  lg: "py-14",
};

const CONTAINER_CLASS: Record<CmsSectionSettings["container"], string> = {
  default: "",
  narrow: "mx-auto max-w-4xl",
  full: "w-full",
};

/**
 * Renders a Wagtail page body: an ordered list of `{ type, value, id }` blocks.
 * `value.component` (not `type`) selects the React component from the
 * registry; the rest of `value` (minus `component`/`settings`) is spread as
 * props. `value.settings` (background/anchor/hidden — see backend
 * `SectionSettingsBlock`) is applied as a thin wrapper so it doesn't disturb
 * each section's own Figma-built spacing/width.
 */
export default function BlockRenderer({ blocks, contextProps = {} }: { blocks: CmsBlock[]; contextProps?: Record<string, Record<string, unknown>> }) {
  return (
    <>
      {blocks.map((block) => {
        const { component, settings, ...props } = block.value;

        if (settings?.hidden) return null;

        const Component = component ? blockRegistry[component] : undefined;
        const runtimeProps = component ? contextProps[component] : undefined;
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `BlockRenderer: no component registered for "${component ?? block.type}"`
            );
          }
          return null;
        }

        const bgClass = settings?.background ? BACKGROUND_CLASS[settings.background] : "";
        const spacingClass = settings?.spacing ? SPACING_CLASS[settings.spacing] : "";
        const containerClass = settings?.container ? CONTAINER_CLASS[settings.container] : "";
        const anchorId = settings?.anchor_id || undefined;

        if (!bgClass && !spacingClass && !containerClass && !anchorId) {
          return <Component key={block.id} {...props} {...runtimeProps} />;
        }

        return (
          <div key={block.id} id={anchorId} className={[bgClass, spacingClass, containerClass].filter(Boolean).join(" ") || undefined}>
            <Component {...props} {...runtimeProps} />
          </div>
        );
      })}
    </>
  );
}
