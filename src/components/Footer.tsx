/* eslint-disable react/jsx-no-target-blank */
import { title, copyright, record } from '../config';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center leading-8 text-sm w-full py-2 border-t text-skin-muted">
      <p>
        Designed & developed by
        <a className="ml-1" target="_blank" href="https://github.com/maqi1520">
          maqibin
        </a>
      </p>
      <p>
        {copyright} {title}
      </p>
      <p>{record}</p>
    </footer>
  );
};

export default Footer;
