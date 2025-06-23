interface TagProps {
  tag: string;
  count?: number;
  variant?: "default" | "active";
  showRemove?: boolean;
}

export function Tag({
  tag,
  count,
  variant = "default",
  showRemove = false,
}: TagProps) {
  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors";

  const variantClasses = {
    default: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    active: "bg-gray-900 text-white hover:bg-gray-800",
  };

  return (
    <a
      href={showRemove ? "/" : `/tag/${tag}`}
      class={`${baseClasses} ${variantClasses[variant]} ${showRemove ? "gap-2" : ""}`}
    >
      <span>
        {tag}
        {count !== undefined && ` (${count})`}
      </span>
      {showRemove && <span class="ml-1 hover:text-gray-300">×</span>}
    </a>
  );
}
