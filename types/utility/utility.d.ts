import { Typeorm } from "../packages/packages";
import { NAbstractHttpAdapter } from "../adapters";

export type Voidable<T> = T | void;
export type Nullable<T> = T | null;
export type UnknownObject = Record<string, unknown>;
export type StringObject = Record<string, string>;
export type AnyObject = Record<string, any>;
export type AnyFunction = (...args: any[]) => any;
export type FnObject = Record<string, AnyFunction>;
export type VoidableStrOrArrStr = string | string[] | void;
export type ModeObject<T = (string | number | boolean)[]> = {
  [key in string]:
    | T
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | (string | number | boolean)[];
};

export const enum BoolYesNo {
  YES = "Y",
  NO = "N",
}
export type Varchar<T extends number> = string;
export type Char<T extends string> = string;
export type ExtendedRecordObject = Record<string, ExtendedObject | string>;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE";

export type UTCDate = {
  date: string;
  time: string;
  utc: string;
};

export type KeyStringLiteralBuilder<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: T[K] extends Record<string, unknown>
        ? `${string & K}:${KeyStringLiteralBuilder<T[K]>}`
        : `${string & K}`;
    }[keyof T]
  : string;
