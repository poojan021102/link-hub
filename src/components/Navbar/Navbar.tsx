import { FaPlus } from 'react-icons/fa';
import LinkHubLogo from '../../assets/link-hub-logo.png';
import { useLinkHubData } from '../../hooks/useLinkHubData';

const Navbar = () => {
  const { openCreateModal, currentOpenedLink } = useLinkHubData();

  return (
    <nav className="fixed top-0 z-40 flex w-full flex-wrap items-center justify-between border-b border-[#e0e0ec] bg-[#f8fafc] p-2 shadow-sm">
      <img className="w-10" src={LinkHubLogo} alt="Link Hub Logo" />
      <button
        type="button"
        onClick={() => openCreateModal(currentOpenedLink ?? 'root')}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2563eb] text-white transition hover:bg-[#1d4ed8]"
        aria-label="Add new entry"
      >
        <FaPlus />
      </button>
    </nav>
  );
};

export default Navbar;
