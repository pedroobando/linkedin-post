'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import clsx from 'clsx';
import Link from 'next/link';
import { usePagination } from './use-pagination';

interface Props {
  totalPages: number;
}

export const Pagination: React.FC<Props> = ({ totalPages }) => {
  const { allPages, createPageUrl, currentPage } = usePagination(totalPages);
  return (
    <div className="flex text-center justify-center my-4">
      <nav aria-label="Page navigation example">
        <ul className="flex list-style-none gap-x-2">
          <li className="page-item">
            <Link
              className={clsx(
                'page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 focus:shadow-none',
                {
                  'hover:text-gray-800 hover:bg-gray-200': currentPage > 1,
                  'opacity-50 cursor-not-allowed pointer-events-none': currentPage <= 1,
                },
              )}
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
            >
              <ChevronLeftIcon size={25} />
            </Link>
          </li>

          {allPages.map((page, idx) => (
            <li key={`${page}_${idx}`} className="page-item">
              <Link
                className={clsx(
                  'page-link relative block py-1.5 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800  focus:shadow-none',
                  {
                    'hover:text-gray-800 hover:bg-gray-200': page !== currentPage,
                  },
                  {
                    'bg-secondary-foreground/90 text-primary-foreground shadow-sm hover:text-primary-foreground hover:bg-secondary-foreground/40':
                      page === currentPage,
                  },
                )}
                href={createPageUrl(page)}
              >
                {page}
              </Link>
            </li>
          ))}

          <li className="page-item">
            <Link
              className={clsx(
                'page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 focus:shadow-none',
                {
                  'hover:text-gray-800 hover:bg-gray-200': currentPage < totalPages,
                  'opacity-50 cursor-not-allowed pointer-events-none': currentPage >= totalPages,
                },
              )}
              href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
            >
              <ChevronRightIcon size={25} />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
