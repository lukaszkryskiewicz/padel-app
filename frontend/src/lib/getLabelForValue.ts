export const getLabelForValue = (
  options: { value: string; label: string }[],
  value: string
) => {
  return options.find((opt) => opt.value == value)?.label ?? value;
};
