import React from 'react';

interface DropdownProps {
  button: React.ReactNode;
  children: React.ReactNode;
  classNames: string;
  animation?: string;
  // eslint-disable-next-line no-unused-vars
  onOpenChange?: (isOpen: boolean) => void;
  isOpen: boolean;
}

function useOutsideAlerter(ref: any, setX: any): void {
  React.useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setX(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, setX]);
}

const Dropdown = (props: DropdownProps) => {
  const { button, children, classNames, animation, onOpenChange, isOpen } = props;
  const wrapperRef = React.useRef(null);

  useOutsideAlerter(wrapperRef, () => onOpenChange?.(false));

  return (
    <div ref={wrapperRef} className="relative flex">
      <div className="flex" onMouseDown={() => onOpenChange?.(!isOpen)}>
        {button}
      </div>
      <div
        className={`${classNames} absolute z-10 ${
          animation || 'origin-top-right transition-all duration-300 ease-in-out'
        } ${isOpen ? 'scale-100' : 'scale-0'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
