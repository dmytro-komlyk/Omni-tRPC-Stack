import React from 'react';

interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: React.ReactNode | string;
}

const routes: IRoute[] = [
  {
    name: 'Example',
    layout: '/',
    path: 'example',
    icon: '',
  },
];

export default routes;
