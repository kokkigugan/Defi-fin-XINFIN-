import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { AppConfig } from '@/utils/AppConfig';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <div className=" ">
    {props.meta}

    <div className="">
      <header className="border-b flex justify-between ">
        <div className="ml-10">
          <h1 className="">
            <Image width="30" height="30" src="/logo.svg" alt="Logo" /> {AppConfig.site_name}
          </h1>
        </div>
        <div className="mr-10">
          <ConnectButton />
        </div>
      </header>

      <main className="">
        {props.children}
      </main>

     
    </div>
  </div>
);

export { Main };
