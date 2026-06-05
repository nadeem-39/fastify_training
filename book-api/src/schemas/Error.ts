export type dbErrorType = {
  code?: string;
  meta?: {
    modelName: string;
    driverAdapterError: {
      name: string;
      cause: {
        originalCode: string;
        originalMessage: string;
        kind: string;
        constraint: {
          index: string;
        };
      };
    };
  };
  clientVersion?: string;
  name?: string;
  message?: string;
};
