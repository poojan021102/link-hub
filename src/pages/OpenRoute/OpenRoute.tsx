import { useEffect } from 'react';
import { FaFolder } from 'react-icons/fa';
import { IoIosArrowBack, IoMdHome } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router';
import { EntryType, type Entry, type FolderEntry } from '../../common/types/linkData.type';
import Loading from '../../components/Loading/Loading';
import { useLinkHubData } from '../../hooks/useLinkHubData';
import Folder from './components/Folder';
import Search from './components/Search';
import URL from './components/URL';

const OpenRoute = () => {
  const { currentOpenedLink, getById, isMutating } = useLinkHubData();
  const [searchParam] = useSearchParams();
  const navigate = useNavigate();
  const currentEntry: Entry | null = (() => {
    if (!currentOpenedLink) {
      return null;
    }
    const entry = getById(currentOpenedLink);
    if (!entry || entry.type === EntryType.URL) {
      return null;
    }
    return entry;
  })();

  useEffect(() => {
    if (!currentOpenedLink) {
      return;
    }

    const currentFetchedEntry = getById(currentOpenedLink);
    if (!currentFetchedEntry) {
      navigate('/root');
      return;
    }

    if (currentFetchedEntry.type === EntryType.URL) {
      if (currentFetchedEntry.parentId) {
        navigate(`/${currentFetchedEntry.parentId}`);
      } else {
        navigate('/root');
      }
    }
  }, [searchParam, currentOpenedLink, isMutating, getById, navigate]);

  const breadcrumbEntries: Array<{ id: string; name: string }> = [];
  {
    let currentId = currentEntry?.id ?? currentOpenedLink ?? 'root';

    while (currentId) {
      const entry = getById(currentId);
      if (!entry) {
        break;
      }

      breadcrumbEntries.unshift({ id: entry.id, name: entry.name });
      currentId = entry.parentId ?? '';
    }
  }

  const renderActionButtons = () => {
    return (
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <button
          disabled={!currentEntry?.parentId}
          onClick={() => navigate(`/${currentEntry?.parentId}`)}
          className="hover:bg-primary-light flex cursor-pointer items-center gap-2 rounded-md bg-white p-2 text-sm shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          <IoIosArrowBack size="20" className="text-primary" />
          <div>Go back</div>
        </button>
        <button
          disabled={!currentEntry?.parentId}
          onClick={() => navigate(`/root`)}
          className="hover:bg-primary-light flex cursor-pointer items-center gap-2 rounded-md bg-white p-2 text-sm shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          <IoMdHome size="20" className="text-primary" />
          <div>Home</div>
        </button>
      </div>
    );
  };

  const renderPage = () => {
    return (
      <div className="mt-2">
        {renderActionButtons()}
        <div className="mt-2 rounded-md border border-[#e0e0ec] bg-[#f8fafc] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#64748b]">
            Current folder
          </div>
          <div className="bg-primary-light text-primary flex flex-wrap items-center gap-2 rounded-md p-3">
            <FaFolder size="20" />
            <div className="flex flex-wrap items-center gap-1">
              {breadcrumbEntries.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/${entry.id}`)}
                  className="cursor-pointer rounded-sm px-1 py-0.5 text-left text-sm font-medium hover:bg-white/70"
                >
                  {index > 0 ? <span className="mr-1 text-[#64748b]">/</span> : null}
                  {entry.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 ml-4 flex flex-col gap-2">
          {(currentEntry as FolderEntry)?.children
            .map((childId) => getById(childId))
            .filter((entry): entry is Entry => Boolean(entry))
            .map((entry) => {
              if (entry.type === EntryType.FOLDER) {
                return <Folder key={entry.id} folderId={entry.id} />;
              }
              return <URL key={entry.id} urlId={entry.id} />;
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Search />
      {!currentEntry || isMutating ? <Loading /> : renderPage()}
    </div>
  );
};

export default OpenRoute;
