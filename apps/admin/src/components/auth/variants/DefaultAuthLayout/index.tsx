import Footer from '@/components/footer/FooterAuthDefault';
import { JSX } from 'react';

function Default(props: { maincard: JSX.Element }) {
  const { maincard } = props;
  return (
    <div className="relative flex">
      <div className="mx-auto flex min-h-screen w-full flex-col justify-center pt-12 lg:px-8 lg:pt-0 xl:px-0">
        <div
          className="absolute inset-0 z-0 opacity-[0.07] dark:opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(#4A5568 1px, transparent 1px), linear-gradient(90deg, #4A5568 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-full my-auto flex flex-col pl-5 pr-5">{maincard}</div>
        <Footer />
      </div>
    </div>
  );
}

export default Default;
