import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import clsx from "clsx";

/** Destination card — image with a bottom gradient, title + up-right arrow, and
 * a truthful starting price when one is available. Figma: Destinations Section
 * (34:1417). Optional
 * `href` makes it a link to the destination detail page. */
export type DestinationCardProps = {
  image?: string;
  title: string;
  price?: string;
  className?: string;
  href?: string;
};

export default function DestinationCard({
  image,
  title,
  price,
  className,
  href,
}: DestinationCardProps) {
  const card = (
    <div
      className={clsx(
        "relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl p-6",
        className,
      )}
    >
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-2xl font-bold tracking-[-0.04em] text-text-inverse">
            {title}
          </h3>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background">
            <Icon
              icon="iconoir:arrow-up-right"
              className="size-4 text-foreground"
            />
          </span>
        </div>
        {price ? (
          <p className="text-base tracking-tight text-[#ebffe8]">
            Starting from <span className="font-semibold">{price}</span>
          </p>
        ) : (
          <p className="text-base tracking-tight text-[#ebffe8]">
            Explore this region
          </p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full w-full">
      {card}
    </Link>
  ) : (
    card
  );
}
