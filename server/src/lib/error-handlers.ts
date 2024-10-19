import type { NextFunction, Request } from "express";

export const generateMapFromREQ = (
  req: Request<{}, {}, Record<string, string | undefined>>
) => {
  const map = new Map<string, string | undefined>();
  for (const key in req.body) {
    map.set(key, req.body[key]);
  }
  return map;
};

export const invalidFieldHandler = (map: Map<string, string | undefined>) => {
  for (const [key, value] of map) {
    if (!value || value.trim() === "") {
      return { message: `${key.toLowerCase()} is required.` };
    }
  }
  return null;
};
