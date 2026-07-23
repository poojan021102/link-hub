import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Loading from '../components/Loading/Loading';
import Modal from '../components/Modal/Modal';
import Navbar from '../components/Navbar/Navbar';
import { useLinkData } from '../hooks/useLinkData';
import { LinkHubContext } from '../hooks/useLinkHubData';

function RootLayout() {
  const linkHubData = useLinkData();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = pathname.split('/')[1];
    if (path.length == 0) {
      navigate('/root');
    } else if (!linkHubData.allLinkData[path]) {
      navigate('/root');
    } else {
      linkHubData.setInitialOpenedLink(path);
    }
  }, [pathname, navigate, linkHubData.allLinkData, linkHubData.setInitialOpenedLink]);

  return (
    <LinkHubContext.Provider value={linkHubData}>
      <div className="h-full w-full">
        <Navbar />
        <Modal />
        {linkHubData.currentOpenedLink ? (
          <div className="h-full w-full p-2 pt-13">
            <Outlet />
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </LinkHubContext.Provider>
  );
}

export default RootLayout;
