import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        
        // Status badges     
        afgehandeld:
          "bg-afgehandeld text-background",
        in_behandeling:
          "bg-in-behandeling text-background",
        gemeld:
          "bg-gemeld text-background",
        afwachting_behandeling:
          "bg-in-afwachting-van-behandeling text-background",
        reactie_gevraagd:
          "bg-reactie-gevraagd text-background",
        ingepland:
          "bg-ingepland text-background",
        extern_verzoek:
          "bg-extern text-background",
        heropend:
          "bg-heropend text-background",
        geannuleerd:
          "bg-geannuleerd text-background",


        // Priority badges
        laag: 
          "bg-muted border text-muted-foreground",
        normaal: 
          "bg-muted border text-muted-foreground",
        hoog: 
          "bg-high border border-high-border text-high-border",


      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px] [&>svg]:size-2.5",
        sm: "px-2 py-0.5 text-[11px] [&>svg]:size-2.5",
        default: "px-2 py-0.5 text-xs [&>svg]:size-3",
        lg: "px-3 py-1 text-sm [&>svg]:size-3.5",
      },

    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
