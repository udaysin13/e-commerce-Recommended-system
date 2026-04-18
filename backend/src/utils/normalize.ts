export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const normalizeOptionalName = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};
