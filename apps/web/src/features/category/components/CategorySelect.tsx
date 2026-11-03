import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { Category } from "@/features/category/types/category";

type CategorySelectProps = {
  id: string;
  categories: Category[];
  value: string;
  onValueChange: (categoryId: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function CategorySelect({
  id,
  categories,
  value,
  onValueChange,
  disabled,
  invalid,
  describedBy,
}: CategorySelectProps) {
  return (
    <NativeSelect
      id={id}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      disabled={disabled}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      className="w-full *:data-[slot=native-select]:h-11 *:data-[slot=native-select]:text-base sm:*:data-[slot=native-select]:text-sm"
    >
      <NativeSelectOption value="" disabled>
        Choose a category
      </NativeSelectOption>
      {categories.map((category) => (
        <NativeSelectOption key={category.id} value={category.id}>
          {category.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
