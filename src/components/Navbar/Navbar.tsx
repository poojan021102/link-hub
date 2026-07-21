import LinkHubLogo from '../../assets/link-hub-logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 flex w-full flex-wrap items-center justify-between border-b border-[#e0e0ec] p-2 shadow-sm">
      <img className="w-10" src={LinkHubLogo} alt="Link Hub Logo" />
      <div className="bg-primary h-10 w-10 cursor-pointer rounded-md text-center font-bold text-white hover:bg-[#073d9b]">
        <div className="hover:text-secondary text-2xl">+</div>
      </div>
    </nav>
  );
};

export default Navbar;
