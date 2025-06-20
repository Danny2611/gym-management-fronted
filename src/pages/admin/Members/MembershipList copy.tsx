import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "~/components/dashboard/ui/avatar/Avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import clsx from "clsx";

import {
  TableHead,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import Spinner from "~/pages/user/Spinner";
import { membershipService } from "~/services/AdminService/membershipService";
import { MembershipResponse, MembershipQueryOptions } from "~/types/membership";
import { PaginationControls } from "~/components/common/PaginationControls";

// Component for Membership Management
const MembershipList: React.FC = () => {
  const navigate = useNavigate();

  // State variables
  const [memberships, setMemberships] = useState<MembershipResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState<boolean>(false);
  const [selectedMembership, setSelectedMembership] =
    useState<MembershipResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
    pending: 0,
  });

  // Sort configuration
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });

  // Fetch all data - combined function
  const fetchAllData = useCallback(
    async (page = pagination.currentPage) => {
      setIsLoading(true);

      try {
        // Prepare query options
        const queryOptions: MembershipQueryOptions = {
          page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          status: activeTab !== "all" ? (activeTab as any) : undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        };

        // Make both API calls concurrently
        const [membershipsResponse, statsResponse] = await Promise.all([
          membershipService.getAllMemberships(queryOptions),
          membershipService.getMemberStats(),
        ]);

        // Handle memberships data
        if (membershipsResponse.success && membershipsResponse.data) {
          setMemberships(membershipsResponse.data.memberships);
          setPagination({
            currentPage: membershipsResponse.data.currentPage,
            totalPages: membershipsResponse.data.totalPages,
            totalItems: membershipsResponse.data.totalMembers,
            limit: pagination.limit,
          });
        } else {
          toast.error(membershipsResponse.message || "Lỗi tải membership!");
        }

        // Handle stats data
        if (statsResponse.success && statsResponse.data) {
          setStatusCounts({
            all: statsResponse.data.total || 0,
            active: statsResponse.data.active || 0,
            expired: statsResponse.data.expired || 0,
            cancelled: statsResponse.data.cancelled || 0,
            pending: statsResponse.data.pending || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit, searchTerm, activeTab, sortConfig],
  );

  // Initial data fetch
  useEffect(() => {
    fetchAllData(1);
  }, [fetchAllData]);

  // Refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllData(1); // Reset to first page when filters change
    }, 500); // Debounce search input

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, sortConfig, fetchAllData]);

  // Handle sort
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const handleDeleteMembership = async () => {
    if (!selectedMembership) return;

    setIsProcessing(true);
    try {
      const response = await membershipService.deleteMembership(
        selectedMembership._id,
      );

      if (response.success) {
        // Update local state safely
        setMemberships((prev) =>
          prev.filter((m) => m._id !== selectedMembership._id),
        );

        // Clear any previous errors
        setDeleteError(null);

        // Show success notification
        toast.success(response.message || "Xóa thành công");

        // Update statistics after successful deletion
        // Use a slight delay to prevent UI "jerks"
        setTimeout(() => {
          membershipService.getMemberStats().then((response) => {
            if (response.success && response.data) {
              setStatusCounts({
                all: response.data.total || 0,
                active: response.data.active || 0,
                expired: response.data.expired || 0,
                cancelled: response.data.cancelled || 0,
                pending: response.data.pending || 0,
              });
            }
          });
        }, 300);
      } else {
        setDeleteError(response.message || "Không thể xóa membership!");
        toast.error(response.message || "Không thể xóa membership!");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi xóa đăng ký.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setIsConfirmDeleteDialogOpen(false);
      setSelectedMembership(null);
    }
  };

  // Handle view membership details
  const handleViewMembershipDetails = (membership: MembershipResponse) => {
    navigate(`/admin/memberships/${membership._id}`);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      active: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        label: "Hoạt động",
      },
      expired: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Hết hạn",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        label: "Đã hủy",
      },
      pending: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Đang xử lý",
      },
    };

    const defaultStatus = {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      label: status.charAt(0).toUpperCase() + status.slice(1),
    };

    const statusDisplay = statusConfig[status] || defaultStatus;

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusDisplay.color}`}
      >
        {statusDisplay.label}
      </span>
    );
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchAllData(page);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchAllData(pagination.currentPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý hội viên
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin và trạng thái của các gói hội viên trong hệ thống.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <Input
              placeholder="Tìm kiếm theo tên, mã hội viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              )}
            </Button>
            <Button variant="outline" disabled={isLoading}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
            </Button>
            <Button variant="outline" disabled={isLoading}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" disabled={isLoading}>
            Tất cả{" "}
            <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
              {statusCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active" disabled={isLoading}>
            Hoạt động{" "}
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {statusCounts.active}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expired" disabled={isLoading}>
            Hết hạn{" "}
            <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {statusCounts.expired}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" disabled={isLoading}>
            Đã hủy{" "}
            <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {statusCounts.cancelled}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" disabled={isLoading}>
            Đang xử lý{" "}
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {statusCounts.pending}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !memberships || memberships.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Không tìm thấy hội viên nào
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không có hội viên nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead
                    className="min-w-[200px] cursor-pointer"
                    onClick={() => handleSort("memberName")}
                  >
                    <div className="flex items-center">
                      Tên hội viên
                      {sortConfig.key === "memberName" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">Tên gói tập</TableHead>
                  <TableHead className="min-w-[150px]">Giá</TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer"
                    onClick={() => handleSort("startDate")}
                  >
                    <div className="flex items-center">
                      Ngày bắt đầu
                      {sortConfig.key === "startDate" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer"
                    onClick={() => handleSort("endDate")}
                  >
                    <div className="flex items-center">
                      Ngày kết thúc
                      {sortConfig.key === "endDate" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">Ngày tạo</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership, index) => (
                  <TableRow key={membership._id}>
                    <TableCell>
                      {(pagination.currentPage - 1) * pagination.limit +
                        index +
                        1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={`http://localhost:5000/${membership.member.avatar}`}
                          alt={membership.member.avatar || "Hội viên"}
                          name={membership.member.name || "Hội viên"}
                          size="md"
                        />
                        <div>
                          <p className="font-medium">
                            {membership.member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {membership.member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{membership.package.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {membership.package.price
                            ? `${membership.package.price.toLocaleString()} đ`
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {membership.start_date
                        ? formatDate(new Date(membership.start_date))
                        : "Chưa xác định"}
                    </TableCell>
                    <TableCell>
                      {membership.end_date
                        ? formatDate(new Date(membership.end_date))
                        : "Chưa xác định"}
                    </TableCell>
                    <TableCell>
                      {membership.created_at
                        ? formatDate(new Date(membership.created_at))
                        : ""}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={membership.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewMembershipDetails(membership)
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-2 h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Xem chi tiết
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={
                              membership.status !== "pending" || isProcessing
                            }
                            className={clsx(
                              "text-red-600",
                              membership.status !== "pending" || isProcessing
                                ? "pointer-events-none opacity-50"
                                : "focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400",
                            )}
                            onClick={() => {
                              if (
                                membership.status === "pending" &&
                                !isProcessing
                              ) {
                                setSelectedMembership(membership);
                                setIsConfirmDeleteDialogOpen(true);
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-2 h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isProcessing) setIsConfirmDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa hội viên</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bạn có chắc chắn muốn xóa hội viên{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedMembership?.member.name || "đã chọn"}
              </span>{" "}
              khỏi hệ thống? Hành động này không thể hoàn tác.
            </p>

            {deleteError && (
              <p className="mt-2 text-sm text-red-500">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteMembership}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Component */}
      {pagination.totalItems > 0 && (
        <div className="mt-4">
          <div className="flex flex-1 items-center justify-between border-t border-gray-200 pb-1 pt-3 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalItems,
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{pagination.totalItems}</span> kết
                quả
              </p>
            </div>
          </div>

          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MembershipList;
