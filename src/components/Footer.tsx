import { title } from '../config';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center leading-8 text-sm w-full py-2 border-t">
      <p>Designed & developed by maqibin</p>
      <p>Copyright© 2009-2021 {title}</p>
      <p>浙ICP备17007919号-1</p>
    </footer>
  );
};

export default Footer;
