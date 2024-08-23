const createPayload = <T extends Record<keyof T, unknown>>(data: T, keyForParams: string) => ({
  [keyForParams]: data,
});

export default createPayload;
