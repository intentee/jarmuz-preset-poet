export interface InitializeCallbackParams {
  signal: AbortSignal;
}

export type InitializeCallback = (params: InitializeCallbackParams) => void;

export function initialize(
  metaUrl: string,
  initializeCallback: InitializeCallback,
): void;
