import { cn } from "@/libs/cn";
import type { ButtonRootProps } from "@kobalte/core/button";
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

export const buttonVariants = cva(
	"uno-inline-flex uno-items-center uno-justify-center uno-rounded-md uno-text-sm uno-font-medium uno-transition-shadow focus-visible:(uno-outline-none uno-ring-1.5 uno-ring-ring) disabled:(uno-pointer-events-none uno-opacity-50) uno-bg-inherit",
	{
		variants: {
			variant: {
				default:
					"uno-bg-primary uno-text-primary-foreground uno-shadow hover:uno-bg-primary/90",
				destructive:
					"uno-bg-destructive uno-text-destructive-foreground uno-shadow-sm hover:uno-bg-destructive/90",
				outline:
					"uno-border uno-border-input uno-bg-background uno-shadow-sm hover:uno-bg-accent hover:uno-text-accent-foreground",
				secondary:
					"uno-bg-secondary uno-text-secondary-foreground uno-shadow-sm hover:uno-bg-secondary/80",
				ghost: "hover:(uno-bg-accent uno-text-accent-foreground)",
				link: "uno-text-primary uno-underline-offset-4 hover:uno-underline",
			},
			size: {
				default: "uno-h-9 uno-px-4 uno-py-2",
				sm: "uno-h-8 uno-px-3 uno-text-xs",
				lg: "uno-h-10 uno-px-8",
				icon: "uno-h-9 uno-w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type buttonProps<T extends ValidComponent = "button"> = ButtonRootProps<T> &
	VariantProps<typeof buttonVariants> & {
		class?: string;
	};

export const Button = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, buttonProps<T>>,
) => {
	const [local, rest] = splitProps(props as buttonProps, [
		"class",
		"variant",
		"size",
	]);

	return (
		<ButtonPrimitive
			class={cn(
				buttonVariants({
					size: local.size,
					variant: local.variant,
				}),
				local.class,
			)}
			{...rest}
		/>
	);
};
