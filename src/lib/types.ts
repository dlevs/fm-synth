// React props
export interface RenderPropComponentProps<T> {
  children: (passedArgs: T) => JSX.Element
}

// Utilities
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
