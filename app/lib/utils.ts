export const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, index);
  const formatted = value.toFixed(1).replace(/\.0$/, "");

  return `${formatted} ${units[index]}`;
};

export const generateUUID = (): string => crypto.randomUUID();
