import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

/** Package card — image with a white info box (title, description, badges).
 * Figma: Packages Section (84:938) destination card. Optional `href` makes it a
 * link to the package detail page. */
export type PackageCardProps = {
  image?: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  rating: string;
  href?: string;
};

export default function PackageCard({
  image,
  title,
  description,
  price,
  duration,
  rating,
  href,
}: PackageCardProps) {
  const card = (
    <div className="relative flex h-[397px] flex-col justify-end overflow-hidden rounded-2xl p-6">
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      )}
      <div className="relative flex w-full flex-col gap-4 rounded-lg bg-white p-6">
        <h3 className="truncate text-lg font-bold tracking-[-0.04em] text-foreground">
          {title}
        </h3>
        <p className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-background px-2.5 py-2 text-sm font-semibold tracking-[-0.04em] text-foreground">
            {price}
          </span>
          <span className="rounded bg-background px-2.5 py-2 text-sm font-semibold tracking-[-0.04em] text-foreground">
            {duration}
          </span>
          {Number(rating) > 0 ? (
            <span className="flex items-center gap-1 rounded bg-background px-2.5 py-2 text-sm font-medium tracking-[-0.04em] text-foreground">
              <Icon
                icon="ic:round-star"
                className="size-[18px] text-foreground"
              />
              {rating}
            </span>
          ) : (
            <span className="rounded bg-background px-2.5 py-2 text-sm font-medium tracking-[-0.04em] text-text-secondary">
              New trip
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
