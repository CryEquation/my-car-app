import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

// Define interfaces for the API data
interface Car {
  id: number;
  mark_id: string;
  folder_id: string;
  price: number;
  images: {
    image: string[];
  };
  // Add other fields you might need for the card
}

interface Meta {
  last_page: number;
  _limit: number;
  page: number;
  _total_rows: number;
}

interface CarsApiResponse {
  data: Car[];
  meta: Meta;
}

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getCars(
  page: number = 1,
  sort?: string,
  order?: string
): Promise<CarsApiResponse> {
  const limit = 12;
  let url = `https://testing-api.ru-rating.ru/cars?_limit=${limit}&_page=${page}`;

  if (sort && order) {
    url += `&_sort=${sort}&_order=${order}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch cars");
  }
  return res.json();
}

// Car Card Component
function CarCard({ car }: { car: Car }) {
  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col items-center">
      {car.images?.image?.[0] && (
        <Image
          src={car.images.image[0]}
          alt={`${car.mark_id} ${car.folder_id}`}
          width={200}
          height={150}
          className="object-cover rounded-md mb-4 w-full h-auto max-w-[200px] sm:max-w-full"
        />
      )}
      <h2 className="text-xl font-semibold mb-2 text-center">{car.mark_id} {car.folder_id}</h2>
      <p className="text-lg font-bold text-blue-600">{car.price.toLocaleString()} ₽</p>
    </div>
  );
}

// Pagination Component
async function Pagination({ meta, currentPage, currentSort, currentOrder }: { meta: Meta, currentPage: number, currentSort?: string, currentOrder?: string }) {
  const totalPages = meta.last_page;

  const getPaginationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set('_page', page.toString());
    if (currentSort) params.set('_sort', currentSort);
    if (currentOrder) params.set('_order', currentOrder);
    return `/?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers.map((page, index) => (
      <li key={index}>
        {page === '...' ? (
          <span className="w-10 h-10 flex items-center justify-center">...</span>
        ) : (
          <Link
            href={getPaginationLink(page as number)}
            className={`w-10 h-10 flex items-center justify-center border rounded-full ${
              page === currentPage ? "bg-blue-500 text-white" : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            }`}
          >
            {page}
          </Link>
        )}
      </li>
    ));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-gray-900 p-4 shadow-lg z-50 flex justify-center border-t border-gray-700">
      <ul className="flex space-x-2">
        {currentPage > 1 && (
          <li>
            <Link
              href={getPaginationLink(currentPage - 1)}
              className="w-10 h-10 flex items-center justify-center border rounded-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              &lt;
            </Link>
          </li>
        )}
        {renderPageNumbers()}
        {currentPage < totalPages && (
          <li>
            <Link
              href={getPaginationLink(currentPage + 1)}
              className="w-10 h-10 flex items-center justify-center border rounded-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              &gt;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

// Sort Options Component
async function SortOptions({ currentSort, currentOrder, currentPage }: { currentSort?: string, currentOrder?: string, currentPage: number }) {

  const getSortLink = (sortField: string, order: string) => {
    const params = new URLSearchParams();
    params.set('_limit', '12');
    params.set('_page', '1');
    params.set('_sort', sortField);
    params.set('_order', order);
    return `/?${params.toString()}`;
  };

  const getClearSortLink = () => {
    const params = new URLSearchParams();
    params.set('_limit', '12');
    params.set('_page', currentPage.toString());
    return `/?${params.toString()}`;
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 sm:gap-2 items-center sm:justify-start px-4 text-white">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">Sort by Price:</h2>
      <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
        <Link
          href={getSortLink("price", "asc")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full text-sm sm:text-base ${
            currentSort === "price" && currentOrder === "asc"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-blue-400 border-blue-500 hover:bg-gray-700"
          }`}
        >
          Price Ascending
        </Link>
        <Link
          href={getSortLink("price", "desc")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full text-sm sm:text-base ${
            currentSort === "price" && currentOrder === "desc"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-blue-400 border-blue-500 hover:bg-gray-700"
          }`}
        >
          Price Descending
        </Link>
        {(currentSort || currentOrder) && (
          <Link
            href={getClearSortLink()}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-700 bg-red-600 text-white text-sm sm:text-base border-red-700"
          >
            Clear Sort
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const page = Array.isArray(searchParams._page) ? parseInt(searchParams._page[0]) : parseInt(searchParams._page || '1');
  const sort = Array.isArray(searchParams._sort) ? searchParams._sort[0] : searchParams._sort;
  const order = Array.isArray(searchParams._order) ? searchParams._order[0] : searchParams._order;

  const { data: cars, meta } = await getCars(page, sort, order);

  return (
    <div className="container mx-auto p-4 pb-20 bg-gray-950 text-white min-h-screen">
      <Suspense>
        <SortOptions currentSort={sort} currentOrder={order} currentPage={page} />
      </Suspense>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.map((car, index) => (
          <CarCard key={`${car.id || 'no-id'}-${car.mark_id}-${car.folder_id}-${index}`} car={car} />
        ))}
      </div>
      <Suspense>
        <Pagination meta={meta} currentPage={page} currentSort={sort} currentOrder={order} />
      </Suspense>
    </div>
  );
}
