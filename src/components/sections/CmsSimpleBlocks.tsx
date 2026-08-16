"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useSubmitLeadMutation, type SubmitLeadInput } from "@/features/leads/leadsApi";
import type { CmsImage } from "@/lib/blocks";

type Heading = { eyebrow?: string; heading?: string; description?: string };
type Button = { label?: string; href?: string; style?: string };

function ImageSource({ image }: { image?: CmsImage }) {
  return image?.src || image?.url || "/images/destination-card-default.png";
}

export function RichTextSection({ heading, body, width = "narrow" }: { heading?: string; body?: string; width?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      {heading && <h2 className="mb-6 text-3xl font-bold text-foreground">{heading}</h2>}
      <div
        className={`prose prose-slate max-w-none text-text-secondary ${width === "narrow" ? "lg:max-w-3xl" : ""}`}
        dangerouslySetInnerHTML={{ __html: body || "" }}
      />
    </section>
  );
}

export function Spacer({ size = "md", show_divider = false }: { size?: string; show_divider?: boolean }) {
  const heights: Record<string, string> = { sm: "h-8", md: "h-16", lg: "h-24", xl: "h-40" };
  return <div className={`${heights[size] || heights.md} ${show_divider ? "border-t border-border" : ""}`} aria-hidden="true" />;
}

export function EmbedSection({ heading, embed, raw_html }: { heading?: Heading; embed?: { html?: string | null; title?: string | null }; raw_html?: string }) {
  const html = embed?.html || raw_html;
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      {heading?.heading && <h2 className="mb-6 text-3xl font-bold text-foreground">{heading.heading}</h2>}
      {heading?.description && <p className="mb-6 text-text-secondary">{heading.description}</p>}
      {html && <div className="overflow-hidden rounded-2xl" dangerouslySetInnerHTML={{ __html: html }} />}
    </section>
  );
}

export function Gallery({ heading, images = [], columns = "3", layout = "grid", enable_lightbox = true }: { heading?: Heading; images?: Array<{ image?: CmsImage; caption?: string }>; columns?: string; layout?: string; enable_lightbox?: boolean }) {
  const grid = columns === "2" ? "sm:grid-cols-2" : columns === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      {heading?.heading && <h2 className="mb-6 text-3xl font-bold text-foreground">{heading.heading}</h2>}
      <div className={layout === "carousel" ? "flex snap-x gap-4 overflow-x-auto pb-3" : `grid gap-4 ${grid}`}>
        {images.map((item, index) => (
          <figure key={`${item.caption || "image"}-${index}`} className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface ${layout === "carousel" ? "w-[80%] shrink-0 snap-start md:w-[45%]" : ""} ${layout === "masonry" && index % 3 === 1 ? "md:mt-8" : ""}`}>
            <a href={enable_lightbox ? ImageSource({ image: item.image }) : undefined} target={enable_lightbox ? "_blank" : undefined} rel="noreferrer"><Image src={ImageSource({ image: item.image })} alt={item.image?.alt || item.caption || ""} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></a>
            {item.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 p-3 text-sm text-white">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function VideoSection({ heading, media, aspect_ratio = "16/9", rounded = true }: { heading?: Heading; media?: { media_type?: string; image?: CmsImage; video?: { url?: string; poster?: CmsImage }; embed?: { html?: string }; alt_override?: string }; aspect_ratio?: string; rounded?: boolean }) {
  const ratio = aspect_ratio === "1/1" ? "aspect-square" : aspect_ratio === "4/3" ? "aspect-[4/3]" : aspect_ratio === "21/9" ? "aspect-[21/9]" : "aspect-video";
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      {heading?.heading && <h2 className="mb-6 text-3xl font-bold text-foreground">{heading.heading}</h2>}
      <div className={`${ratio} relative overflow-hidden bg-secondary ${rounded ? "rounded-2xl" : ""}`}>
        {media?.media_type === "video" && media.video?.url ? <video src={media.video.url} poster={ImageSource({ image: media.video.poster })} controls className="size-full object-cover" /> : media?.media_type === "embed" && media.embed?.html ? <div className="size-full" dangerouslySetInnerHTML={{ __html: media.embed.html }} /> : <Image src={ImageSource({ image: media?.image })} alt={media?.alt_override || media?.image?.alt || ""} fill className="object-cover" />}
      </div>
    </section>
  );
}

export function LeadForm({ heading, form_key = "enquiry", fields = [], submit_label = "Send enquiry", success_message = "Thanks! We'll get back to you shortly." }: { heading?: Heading; form_key?: string; fields?: Array<{ name: string; label: string; field_type: string; placeholder?: string; required?: boolean; options?: string[] }>; submit_label?: string; success_message?: string }) {
  const [formStartedAt] = useState(() => Date.now() / 1000);
  const [submitLead, { isLoading, isSuccess, isError }] = useSubmitLeadMutation();
  const [error, setError] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    const form = new FormData(event.currentTarget);
    const payload: SubmitLeadInput = { form_key, source_url: window.location.href, consent: form.get("privacy_consent") === "yes", form_started_at: Number(event.currentTarget.dataset.startedAt || formStartedAt) };
    fields.forEach((field) => { payload[field.name] = String(form.get(field.name) || ""); });
    try { await submitLead(payload).unwrap(); } catch { setError(true); }
  };
  return (
      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      {heading?.heading && <h2 className="mb-2 text-3xl font-bold text-foreground">{heading.heading}</h2>}
      {heading?.description && <p className="mb-8 text-text-secondary">{heading.description}</p>}
      {isSuccess ? <p className="rounded-lg bg-primary/10 p-5 text-primary-active">{success_message}</p> : <form onSubmit={submit} data-started-at={formStartedAt} className="grid gap-5 rounded-2xl border border-border bg-surface p-6">{fields.map((field) => field.field_type === "textarea" ? <label key={field.name} className="grid gap-2 text-sm font-medium text-foreground">{field.label}<textarea name={field.name} required={field.required} placeholder={field.placeholder} rows={4} className="rounded-lg border border-border p-3" /></label> : field.field_type === "select" ? <label key={field.name} className="grid gap-2 text-sm font-medium text-foreground">{field.label}<select name={field.name} required={field.required} className="rounded-lg border border-border p-3"><option value="">Select…</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select></label> : <label key={field.name} className="grid gap-2 text-sm font-medium text-foreground">{field.label}<input name={field.name} type={field.field_type} required={field.required} placeholder={field.placeholder} className="rounded-lg border border-border p-3" /></label>)}<label className="flex items-center gap-3 text-sm text-text-secondary"><input type="checkbox" name="privacy_consent" value="yes" required />I agree to the <a href="/privacy" className="underline">privacy policy</a>.</label>{(isError || error) && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}<button type="submit" disabled={isLoading} className="rounded-lg bg-foreground px-5 py-3 font-medium text-background disabled:opacity-60">{isLoading ? "Sending…" : submit_label}</button></form>}
    </section>
  );
}

function SectionHeading({ heading }: { heading?: Heading | string }) {
  const value = typeof heading === "string" ? { heading } : heading;
  if (!value?.heading && !value?.description && !value?.eyebrow) return null;
  return <div className="mb-8 max-w-2xl"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-active">{value?.eyebrow}</p>{value?.heading && <h2 className="text-3xl font-bold text-foreground">{value.heading}</h2>}{value?.description && <p className="mt-3 text-lg text-text-secondary">{value.description}</p>}</div>;
}

function Buttons({ buttons = [] }: { buttons?: Button[] }) {
  return <div className="mt-6 flex flex-wrap gap-3">{buttons.filter((button) => button.label && button.href).map((button) => <a key={`${button.label}-${button.href}`} href={button.href} className={`rounded-lg px-5 py-3 font-medium ${button.style === "outline" ? "border border-white text-white" : "bg-primary-accent text-foreground"}`}>{button.label}</a>)}</div>;
}

export function HeaderCard({ heading, image, buttons = [], overlay_opacity = 60 }: { heading?: Heading; image?: CmsImage; buttons?: Button[]; overlay_opacity?: number }) {
  return <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10"><div className="relative min-h-[300px] overflow-hidden rounded-3xl bg-secondary"><Image src={ImageSource({ image })} alt={image?.alt || heading?.heading || ""} fill className="object-cover" /><div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity / 100 }} /><div className="relative flex min-h-[300px] flex-col justify-center p-8 text-white lg:p-14"><SectionHeading heading={heading} /><Buttons buttons={buttons} /></div></div></section>;
}

export function FeaturesList({ heading, description, image, image_position = "left", items = [] }: { heading?: string; description?: string; image?: CmsImage; image_position?: string; items?: Array<{ number?: string; title: string; description?: string; icon?: string }> }) {
  return <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-10">{image_position === "left" && <div className="relative aspect-square w-full overflow-hidden rounded-3xl lg:w-1/2"><Image src={ImageSource({ image })} alt={image?.alt || ""} fill className="object-cover" /></div>}<div className="flex-1"><SectionHeading heading={{ heading, description }} /><div className="grid gap-5">{items.map((item, index) => <article key={`${item.title}-${index}`} className="flex gap-4 rounded-xl border border-border bg-surface p-5"><span className="text-sm font-bold text-primary-active">{item.number || String(index + 1).padStart(2, "0")}</span><div><h3 className="font-semibold text-foreground">{item.title}</h3>{item.description && <p className="mt-1 text-text-secondary">{item.description}</p>}</div></article>)}</div></div>{image_position !== "left" && <div className="relative aspect-square w-full overflow-hidden rounded-3xl lg:w-1/2"><Image src={ImageSource({ image })} alt={image?.alt || ""} fill className="object-cover" /></div>}</section>;
}

export function StatsSection({ heading, stats = [], background_image, overlay_opacity = 75 }: { heading?: string; stats?: Array<{ value: string; label: string; icon?: string }>; background_image?: CmsImage; overlay_opacity?: number }) {
  return <section className="relative overflow-hidden bg-secondary py-16 text-white"><Image src={ImageSource({ image: background_image })} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity / 100 }} /><div className="relative mx-auto max-w-7xl px-6 lg:px-10">{heading && <h2 className="mb-10 text-3xl font-bold">{heading}</h2>}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat, index) => <div key={`${stat.label}-${index}`} className="rounded-2xl border border-white/20 bg-black/20 p-6"><p className="text-3xl font-bold text-primary-accent">{stat.value}</p><p className="mt-2 text-white/80">{stat.label}</p></div>)}</div></div></section>;
}

export function Testimonial({ background_image, quote, author_name, author_role, overlay_opacity = 70 }: { background_image?: CmsImage; quote?: string; author_name?: string; author_role?: string; overlay_opacity?: number }) {
  return <section className="relative overflow-hidden bg-secondary py-24 text-white"><Image src={ImageSource({ image: background_image })} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black" style={{ opacity: overlay_opacity / 100 }} /><figure className="relative mx-auto max-w-4xl px-6 text-center"><blockquote className="text-2xl font-medium leading-relaxed lg:text-4xl">“{quote || "A memorable journey from start to finish."}”</blockquote>{author_name && <figcaption className="mt-6 text-white/80"><strong className="text-white">{author_name}</strong>{author_role ? ` · ${author_role}` : ""}</figcaption>}</figure></section>;
}

export function TestimonialsCarousel({ heading, resolved_testimonials = [], testimonials = [] }: { heading?: Heading; resolved_testimonials?: Array<{ quote: string; author_name: string; author_role?: string; rating?: number }>; testimonials?: Array<{ quote: string; author_name: string; author_role?: string; rating?: number }> }) {
  const items = resolved_testimonials.length ? resolved_testimonials : testimonials;
  return <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><SectionHeading heading={heading} /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <figure key={`${item.author_name}-${index}`} className="rounded-2xl border border-border bg-surface p-6"><blockquote className="text-lg leading-relaxed text-text-secondary">“{item.quote}”</blockquote><figcaption className="mt-5 font-semibold text-foreground">{item.author_name}{item.author_role ? <span className="block text-sm font-normal text-text-muted">{item.author_role}</span> : null}</figcaption></figure>)}</div></section>;
}
