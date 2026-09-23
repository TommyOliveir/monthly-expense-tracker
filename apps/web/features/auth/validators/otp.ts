export const validateOtp = ({ value }: { value: string }) => {
  if (!value) {
    return "Code is required!";
  }

  if (!/^\d{6}$/.test(value)) {
    return "Code must be 6 digits";
  }

  return undefined;
};
