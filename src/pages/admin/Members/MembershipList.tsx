import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Eye, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { membershipService } from "~/services/admin/membershipService";
import { MembershipResponse, MembershipQueryOptions } from "~/types/membership";
import { PaginationControls } from "~/components/common/PaginationControls";
import Avatar from "~/components/dashboard/ui/avatar/Avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHead,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const MembershipManagement = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<MembershipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputValue, setSearchInputValue] = useState(""); // Tách biệt giá trị input và giá trị tìm kiếm thực tế
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMembership, setViewMembership] =
    useState<MembershipResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const limit = 10;
  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    expired: 0,
    pending: 0,
    paused: 0,
  });
  // Thêm debounce timer để tránh gọi API quá nhiều
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Status color mapping
  const statusColorMap = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    paused: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: MembershipQueryOptions = {
        page: currentPage,
        limit,
        search: searchTerm,
        sortBy,
        sortOrder,
      };

      // Apply status filter only if not "all"
      if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter as
          | "active"
          | "expired"
          | "pending"
          | "paused";
      }

      const response = await membershipService.getAllMemberships(filters);

      if (response.success && response.data) {
        setMemberships(response.data.memberships);
        setTotalPages(response.data.totalPages);
        setTotalMembers(response.data.totalMembers);
      } else {
        setError(response.message || "Không thể tải danh sách hội viên");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách hội viên");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch stats for member counts
  const fetchMemberStats = async () => {
    try {
      const response = await membershipService.getMemberStats();
      console.log("d: ", response);
      if (response.success && response.data) {
        setStatusCounts({
          all: response.data.total,
          active: response.data.active,
          expired: response.data.expired,
          pending: response.data.pending,
          paused: response.data.paused,
        });
      }
    } catch (error) {
      console.error("Error fetching member stats:", error);
    }
  };
  useEffect(() => {
    fetchMemberships();
    fetchMemberStats();
  }, [fetchMemberships]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi trong input tìm kiếm với debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);

    // Clear previous timeout if it exists
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce
  };

  // Xử lý người dùng nhấn Enter để tìm kiếm ngay lập tức
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any pending timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Update search term immediately
    setSearchTerm(searchInputValue);
    setCurrentPage(1); // Reset to first page
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStatusFilter(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleViewMembership = async (membershipId: string) => {
    try {
      const response = await membershipService.getMembershipById(membershipId);
      if (response.success && response.data) {
        setViewMembership(response.data);
        setIsViewDialogOpen(true);
      } else {
        toast.error(response.message || "Không thể tải thông tin hội viên");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tải thông tin hội viên");
      console.error(err);
    }
  };

  const handleDeleteClick = (membershipId: string) => {
    setMembershipToDelete(membershipId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!membershipToDelete) return;

    try {
      setIsDeleting(true);
      console.log("Deleting membership:", membershipToDelete);

      const response =
        await membershipService.deleteMembership(membershipToDelete);
      console.log("Response from delete service:", response);

      if (response.success) {
        toast.success("Đã xóa hội viên thành công");
        fetchMemberships();
      } else {
        toast.error(response.message || "Không thể xóa hội viên");
      }
    } catch (err) {
      console.error("Error in handleConfirmDelete:", err);
      toast.error("Đã xảy ra lỗi khi xóa hội viên");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMembershipToDelete(null);
    }
  };

  // Clear debounce timer on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Chưa cập nhật";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const calculateProgress = (used: number, available: number) => {
    const total = used + available;
    return total > 0 ? (used / total) * 100 : 0;
  };

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Quản Lý Hội Viên
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          Quản lý danh sách hội viên, theo dõi trạng thái đăng ký và các gói tập
          đã mua.
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:gap-4 md:flex-row">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              className="pl-10 text-sm sm:text-base"
              value={searchInputValue}
              onChange={handleSearchInputChange}
            />
          </div>
        </form>

        <div className="xs:flex-row flex flex-col items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => handleSortChange(value)}
          >
            <SelectTrigger className="xs:w-[180px] w-full text-sm sm:text-base">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Ngày tạo</SelectItem>
              <SelectItem value="end_date">Ngày hết hạn</SelectItem>
              <SelectItem value="member.name">Tên hội viên</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="xs:w-auto flex w-full items-center gap-1 text-sm sm:text-base"
          >
            {sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
          </Button>
        </div>
      </div>

      <div className="mb-4 overflow-x-auto sm:mb-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-4 sm:mb-6"
        >
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Tất cả{" "}
              <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
                {statusCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Đang hoạt động{" "}
              <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {statusCounts.active}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Chờ xử lý{" "}
              <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {statusCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="paused" className="text-xs sm:text-sm">
              Tạm dừng{" "}
              <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
                {statusCounts.paused}
              </span>
            </TabsTrigger>
            <TabsTrigger value="expired" className="text-xs sm:text-sm">
              Hết hạn{" "}
              <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {statusCounts.expired}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
                <p className="text-sm sm:text-base">{error}</p>
                <Button
                  onClick={() => fetchMemberships()}
                  variant="destructive"
                  className="mt-2 text-sm sm:text-base"
                >
                  Thử lại
                </Button>
              </div>
            ) : memberships.length > 0 ? (
              <>
                {/* For mobile view: Card layout */}
                <div className="block sm:hidden">
                  {memberships.map((membership) => (
                    <div
                      key={membership._id}
                      className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={membership.member.avatar}
                            alt={membership.member.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {membership.member.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {membership.member.email}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            statusColorMap[
                              membership.status as keyof typeof statusColorMap
                            ]
                          }
                        >
                          {membership.status === "active" && "Đang hoạt động"}
                          {membership.status === "expired" && "Hết hạn"}
                          {membership.status === "pending" && "Chờ xử lý"}
                          {membership.status === "paused" && "Tạm dừng"}
                        </Badge>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Gói tập:
                          </span>
                          <div className="font-medium">
                            {membership.package.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {membership.package.price.toLocaleString("vi-VN")}{" "}
                            VND
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Thời hạn:
                          </span>
                          <div className="font-medium">
                            {formatDate(membership.start_date)} -{" "}
                            {formatDate(membership.end_date)}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span>
                            {membership.used_sessions} /{" "}
                            {membership.used_sessions +
                              membership.available_sessions}
                          </span>
                          <span>Còn {membership.available_sessions} buổi</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${calculateProgress(
                                membership.used_sessions,
                                membership.available_sessions,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleViewMembership(membership._id)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Chi tiết
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(membership._id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* For tablet and desktop: Table layout */}
                <div className="mb-4 hidden overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] sm:w-[250px]">
                          <button
                            onClick={() => handleSortChange("member.name")}
                            className="flex items-center text-left text-xs font-medium sm:text-sm"
                          >
                            Hội viên {renderSortIcon("member.name")}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSortChange("package.name")}
                            className="flex items-center text-left text-xs font-medium sm:text-sm"
                          >
                            Gói tập {renderSortIcon("package.name")}
                          </button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <button
                            onClick={() => handleSortChange("start_date")}
                            className="flex items-center text-left text-xs font-medium sm:text-sm"
                          >
                            Ngày bắt đầu {renderSortIcon("start_date")}
                          </button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <button
                            onClick={() => handleSortChange("end_date")}
                            className="flex items-center text-left text-xs font-medium sm:text-sm"
                          >
                            Ngày kết thúc {renderSortIcon("end_date")}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSortChange("status")}
                            className="flex items-center text-left text-xs font-medium sm:text-sm"
                          >
                            Trạng thái {renderSortIcon("status")}
                          </button>
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          <span className="text-xs sm:text-sm">Buổi tập</span>
                        </TableHead>
                        <TableHead className="w-[80px] text-right sm:w-[100px]">
                          <span className="text-xs sm:text-sm">Thao tác</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {memberships.map((membership) => (
                        <TableRow key={membership._id}>
                          <TableCell>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar
                                src={membership.member.avatar}
                                alt={membership.member.name}
                                className="h-8 w-8 rounded-full sm:h-10 sm:w-10"
                              />
                              <div>
                                <div className="text-xs font-medium sm:text-sm">
                                  {membership.member.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {membership.member.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium sm:text-sm">
                              {membership.package.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {membership.package.price.toLocaleString("vi-VN")}{" "}
                              VND
                            </div>
                          </TableCell>
                          <TableCell className="hidden text-xs sm:text-sm md:table-cell">
                            {formatDate(membership.start_date)}
                          </TableCell>
                          <TableCell className="hidden text-xs sm:text-sm md:table-cell">
                            {formatDate(membership.end_date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColorMap[
                                  membership.status as keyof typeof statusColorMap
                                ]
                              }
                            >
                              {membership.status === "active" &&
                                "Đang hoạt động"}
                              {membership.status === "expired" && "Hết hạn"}
                              {membership.status === "pending" && "Chờ xử lý"}
                              {membership.status === "paused" && "Tạm dừng"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="mb-1 flex justify-between text-xs">
                              <span>
                                {membership.used_sessions} /{" "}
                                {membership.used_sessions +
                                  membership.available_sessions}
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${calculateProgress(
                                    membership.used_sessions,
                                    membership.available_sessions,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Mở menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewMembership(membership._id)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(membership._id)
                                  }
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
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

                <div className="mt-4">
                  <div className="xs:flex-row flex flex-1 flex-col items-center justify-between border-t border-gray-200 pb-1 pt-3 text-xs dark:border-gray-700 sm:text-sm">
                    <span className="xs:mb-0 mb-2">
                      Hiển thị {memberships.length} trên tổng số {totalMembers}{" "}
                      hội viên
                    </span>

                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Không tìm thấy hội viên nào. Vui lòng thử lại với tiêu chí
                  khác.
                </p>
              </div>
            )}

            {/* View Membership Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-[600px] sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    Chi tiết hội viên
                  </DialogTitle>
                </DialogHeader>

                {viewMembership && (
                  <div className="grid gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar
                        src={viewMembership.member.avatar}
                        alt={viewMembership.member.name}
                        className="h-12 w-12 rounded-full sm:h-16 sm:w-16"
                      />
                      <div>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          {viewMembership.member.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {viewMembership.member.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Card>
                        <CardContent className="p-3 text-sm sm:p-4">
                          <h4 className="mb-2 font-semibold">
                            Thông tin gói tập
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Tên gói:
                              </span>
                              <span className="font-medium">
                                {viewMembership.package.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Giá:
                              </span>
                              <span className="font-medium">
                                {viewMembership.package.price.toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                VND
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Thời hạn:
                              </span>
                              <span className="font-medium">
                                {viewMembership.package.duration} ngày
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Buổi tập cá nhân:
                              </span>
                              <span className="font-medium">
                                {viewMembership.package.training_sessions}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3 text-sm sm:p-4">
                          <h4 className="mb-2 font-semibold">Trạng thái</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Trạng thái:
                              </span>
                              <Badge
                                className={
                                  statusColorMap[
                                    viewMembership.status as keyof typeof statusColorMap
                                  ]
                                }
                              >
                                {viewMembership.status === "active" &&
                                  "Đang hoạt động"}
                                {viewMembership.status === "expired" &&
                                  "Hết hạn"}
                                {viewMembership.status === "pending" &&
                                  "Chờ xử lý"}
                                {viewMembership.status === "paused" &&
                                  "Tạm dừng"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Tự động gia hạn:
                              </span>
                              <span className="font-medium">
                                {viewMembership.auto_renew ? "Có" : "Không"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Ngày bắt đầu:
                              </span>
                              <span className="font-medium">
                                {formatDate(viewMembership.start_date)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Ngày kết thúc:
                              </span>
                              <span className="font-medium">
                                {formatDate(viewMembership.end_date)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-3 text-sm sm:p-4">
                        <h4 className="mb-2 font-semibold">Sử dụng buổi tập</h4>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>
                            Đã sử dụng {viewMembership.used_sessions} /{" "}
                            {viewMembership.used_sessions +
                              viewMembership.available_sessions}{" "}
                            buổi
                          </span>
                          <span>
                            Còn lại: {viewMembership.available_sessions} buổi
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-4">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${calculateProgress(
                                viewMembership.used_sessions,
                                viewMembership.available_sessions,
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {viewMembership.last_sessions_reset && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            Cập nhật lần cuối:{" "}
                            {formatDate(viewMembership.last_sessions_reset)}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="xs:flex-row flex flex-col justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Ngày tạo: {formatDate(viewMembership.created_at)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Cập nhật: {formatDate(viewMembership.updated_at)}
                      </span>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:w-auto"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-xs p-4 sm:max-w-md sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    Xác nhận xóa
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 text-sm sm:text-base">
                  <p>Bạn có chắc chắn muốn xóa hội viên này không?</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeleting}
                    className="w-full text-sm sm:w-auto"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="w-full text-sm sm:w-auto"
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipManagement;
