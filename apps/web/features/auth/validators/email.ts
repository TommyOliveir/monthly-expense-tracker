export function validateEmail({ value }: { value: string }) {
  if (!value) {
    return "Email is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email";
  }

  return undefined;
}
