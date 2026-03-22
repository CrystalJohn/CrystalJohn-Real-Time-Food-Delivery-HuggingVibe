'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { JobList } from '@/features/driver';
import { PageContainer } from '@/components/layout';
import { driverProfileService } from '@/features/driver/driverProfile.service';

export default function DriverJobsPage() {
  const [toggling, setToggling] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const profile = await driverProfileService.getMyProfile();
        if (!ignore) {
          setIsOnline(Boolean(profile.isOnline));
        }
      } catch (e) {
        console.error('Load driver profile failed', e);
        toast.error('Không tải được trạng thái tài xế.');
      } finally {
        if (!ignore) {
          setLoadingStatus(false);
        }
      }
    };

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleOnline = async () => {
    if (toggling || loadingStatus) return;

    setToggling(true);
    try {
      if (isOnline) {
        await driverProfileService.goOffline();
        setIsOnline(false);
        toast.success('Bạn đã Offline, sẽ không nhận thêm đơn mới.');
      } else {
        await driverProfileService.goOnline();
        setIsOnline(true);
        toast.success('Bạn đang Online, staff có thể assign đơn cho bạn.');
      }
    } catch (e) {
      console.error('Toggle online failed', e);
      toast.error('Không đổi được trạng thái Online. Vui lòng thử lại.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">My Delivery Jobs</h1>
            <p className="text-gray-600">Track and manage your active deliveries</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleOnline}
              disabled={toggling || loadingStatus}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                isOnline
                  ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {loadingStatus ? 'Loading...' : isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>

        <JobList />
      </div>
    </PageContainer>
  );
}