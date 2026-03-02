import * as React from 'react';

export interface IRoute {
  name: string;
  layout: string;
  icon: React.ReactNode | string;
  items?: any;
  path: string;
  secondary?: boolean | undefined;
}
export interface RoutesType {
  name: string;
  layout: string;
  icon: React.ReactNode | string;
  path: string;
  secondary?: boolean | undefined;
}
