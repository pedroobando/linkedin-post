import { ChartAreaInteractive } from '@/components/dash/chart-area-interactive';
import { DataTable } from '@/components/dash/data-table';
import { SectionCards } from '@/components/dash/section-cards';
import { SiteHeader } from '@/components/dash/site-header';

import data from './data.json';

export default function DashPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
