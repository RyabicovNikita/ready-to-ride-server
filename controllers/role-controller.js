export function getRoles() {
  return Object.entries(roles).map(([key, value]) => ({ id: value, name: key }));
}
